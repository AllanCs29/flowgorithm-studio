import { FlowFunction, FlowNode, NodeId } from '../domain/models';

export interface Point { readonly x: number; readonly y: number; readonly width: number; readonly height: number; }
export interface LayoutEdge { readonly id:string; readonly from:NodeId; readonly to:NodeId; readonly kind:'next'|'true'|'false'|'body'|'return'|'merge'; readonly path?:string; readonly label?:string; readonly labelX?:number; readonly labelY?:number; }
export interface LayoutMap { readonly nodes:Readonly<Record<string,Point>>; readonly edges:readonly LayoutEdge[]; readonly width:number; readonly height:number; readonly orientation:'Vertical'|'Horizontal'; }
export interface LayoutOptions { readonly orientation:'Vertical'|'Horizontal'; readonly gapX:number; readonly gapY:number; readonly branchGap:number; readonly nodeWidth:number; readonly nodeHeight:number; }
export const DEFAULT_LAYOUT: LayoutOptions = { orientation:'Vertical',gapX:58,gapY:40,branchGap:70,nodeWidth:168,nodeHeight:58 };
interface Dim { width:number; height:number; }
interface XY {x:number;y:number}

export class LayoutEngine {
 calculate(func:FlowFunction,opts:LayoutOptions=DEFAULT_LAYOUT):LayoutMap {
  const W=opts.nodeWidth, H=opts.nodeHeight, gapY=Math.max(40,opts.gapY), gapX=Math.max(48,opts.gapX), branchGap=Math.max(50,opts.branchGap);
  const positions:Record<string,Point>={}; const ports:Record<string,XY>={}; const joins:Record<string,XY>={};
  const dims = new Map<string,Dim>(); const visiting=new Set<string>();
  const measure=(start:NodeId|undefined):Dim=>{
   if(!start) return {width:0,height:0};
   if(dims.has(start)) return dims.get(start)!;
   if(visiting.has(start)) return {width:W,height:H};
   visiting.add(start); let width=W,height=0, guard=0;let cursor:NodeId|undefined=start;
   while(cursor && guard++<Object.keys(func.nodes).length+2){
    const node:FlowNode|undefined=func.nodes[cursor]; if(!node)break;
    const local=measureNode(node); width=Math.max(width,local.width);height+=local.height+gapY;
    cursor=node.next;
   }
   const result={width,height:Math.max(H,height-gapY)};dims.set(start,result);visiting.delete(start);return result;
  };
  const measureNode=(node:FlowNode):Dim=>{
   if(node.type==='If'){
    const yes=measure(node.trueNext),no=measure(node.falseNext);
    return {width:Math.max(W+branchGap,yes.width+no.width+gapX*2),height:H+gapY+Math.max(yes.height,no.height,45)+gapY+32};
   }
   if(node.type==='While'||node.type==='For'||node.type==='Do'){
    const body=measure(node.bodyNext);
    return {width:Math.max(W+branchGap,body.width+gapX*2+28),height:H+gapY+Math.max(body.height,42)+gapY+30};
   }
   return {width:W,height:H};
  };
  const placed=new Set<NodeId>();
  const place=(start:NodeId|undefined,left:number,top:number):void=>{
   if(!start)return;
   const sequence=measure(start);let y=top,guard=0;let cursor:NodeId|undefined=start;
   while(cursor && guard++<Object.keys(func.nodes).length+2){
    const node:FlowNode|undefined=func.nodes[cursor];if(!node||placed.has(cursor))break;
    placed.add(cursor);
    const size=measureNode(node);const centerX=left+sequence.width/2;
    positions[cursor]={x:centerX-W/2,y,width:W,height:H};
    if(node.type==='If'){
     const a=measure(node.trueNext);
     const baseLeft=centerX-size.width/2;
     if(node.trueNext)place(node.trueNext,baseLeft+gapX/2,y+H+gapY);
     if(node.falseNext)place(node.falseNext,baseLeft+gapX/2+a.width+gapX,y+H+gapY);
     const joinY=y+size.height-24;
     joins[cursor]={x:centerX,y:joinY};ports[cursor]={x:centerX,y:joinY};
    }else if(node.type==='While'||node.type==='Do'||node.type==='For'){
     if(node.bodyNext)place(node.bodyNext,centerX+W/2+gapX/2,y+H+gapY);
     joins[cursor]={x:centerX,y:y+size.height-24};ports[cursor]={x:centerX,y:y+size.height-24};
    }else ports[cursor]={x:centerX,y:y+H};
    y+=size.height+gapY;
    cursor=node.next;
   }
  };
  measure(func.rootNodeId);place(func.rootNodeId,85,90);
  // Invalid imported graphs still receive a visible placement; validation lives in the domain.
  Object.keys(func.nodes).filter(k=>!positions[k]).forEach((key,i)=>{positions[key]={x:85+i*(W+gapX),y:700,width:W,height:H};ports[key]={x:85+i*(W+gapX)+W/2,y:700+H};});
  const edges:LayoutEdge[]=[];
  const transform=(p:XY):XY=>opts.orientation==='Vertical'?p:{x:p.y+55,y:p.x-55};
  const route=(id:string,from:NodeId,to:NodeId,kind:LayoutEdge['kind'],points:XY[],label?:string,labelAt?:XY)=>{
   const pts=points.map(transform);if(pts.length<2)return;
   const t=labelAt?transform(labelAt):undefined;
   edges.push({id,from,to,kind,path:pts.map((p,i)=>`${i===0?'M':'L'} ${p.x} ${p.y}`).join(' '),label,labelX:t?.x,labelY:t?.y});
  };
  const first=(id:NodeId):XY|undefined=>positions[id]?{x:positions[id].x+W/2,y:positions[id].y}:undefined;
  const last=(start:NodeId|undefined):NodeId|undefined=>{let n=start,old:NodeId|undefined,guard=0;while(n&&func.nodes[n]&&guard++<Object.keys(func.nodes).length+1){old=n;n=func.nodes[n].next;}return old;};
  for(const node of Object.values(func.nodes)){
   const p=positions[node.id]; if(!p)continue;
   const cx=p.x+W/2,cy=p.y+H/2;
   if(node.type==='If'){
    const join=joins[node.id];
    (['true','false'] as const).forEach((kind,index)=>{
     const target=index===0?node.trueNext:node.falseNext;
     const elbowX=cx+(index===0?-W/2-28:W/2+28);
     const root=target?first(target):undefined;
     const side={x:cx+(index===0?-W/2:W/2),y:cy};
     const finish=root??join;
     route(`${node.id}:${kind}`,node.id,target??node.id,kind,[side,{x:elbowX,y:cy},{x:elbowX,y:finish.y-17},{x:finish.x,y:finish.y-17},finish],index===0?'Sí':'No',{x:elbowX,y:cy-10});
     const tail=last(target);
     if(tail&&ports[tail]){const exit=ports[tail];route(`${node.id}:${kind}:merge`,tail,node.id,'merge',[exit,{x:exit.x,y:join.y},{x:join.x,y:join.y}]);}
    });
   }
   if(node.type==='While'||node.type==='Do'||node.type==='For'){
    const body=node.bodyNext?first(node.bodyNext):undefined;
    const exit=joins[node.id];
    if(body){route(`${node.id}:body`,node.id,node.bodyNext!,'body',[{x:cx+W/2,y:cy},{x:body.x,y:cy},{x:body.x,y:body.y}],node.type==='Do'?'Entrar':'Sí',{x:cx+W/2+17,y:cy-12});
      const tail=last(node.bodyNext);if(tail&&ports[tail]){
       const out=ports[tail];const backX=cx-W/2-48;
       route(`${node.id}:back`,tail,node.id,'return',[out,{x:out.x,y:exit.y-13},{x:backX,y:exit.y-13},{x:backX,y:p.y-21},{x:cx,y:p.y-21},{x:cx,y:p.y}], '↻ Repetir',{x:backX+3,y:exit.y-23});
      }
    }
    if(node.next){route(`${node.id}:exit`,node.id,node.next,'next',[{x:cx,y:cy+H/2},{x:cx,y:exit.y}],node.type==='Do'?'No':'No',{x:cx+13,y:exit.y-15});}
   }
   if(node.next&&first(node.next)){
    const a=ports[node.id],b=first(node.next)!;
    if(a&&!(node.type==='While'||node.type==='Do'||node.type==='For'))route(`${node.id}:next`,node.id,node.next,'next',[a,{x:a.x,y:b.y},b]);
    if(a&&(node.type==='While'||node.type==='Do'||node.type==='For'))route(`${node.id}:next-tail`,node.id,node.next,'next',[a,{x:a.x,y:b.y},b]);
   }
  }
  let finalPositions:Record<string,Point>=positions;
  if(opts.orientation==='Horizontal'){
   finalPositions={};for(const [id,p]of Object.entries(positions)){const center=transform({x:p.x+W/2,y:p.y+H/2});finalPositions[id]={x:center.x-W/2,y:center.y-H/2,width:W,height:H};}
  }
  const all=Object.values(finalPositions);
  const maxX=Math.max(900,...all.map(p=>p.x+p.width+110),...edges.flatMap(e=>[e.labelX??0]));
  const maxY=Math.max(620,...all.map(p=>p.y+p.height+120),...edges.flatMap(e=>[e.labelY??0]));
  const offsetX=Math.min(0,...all.map(p=>p.x-50));const offsetY=Math.min(0,...all.map(p=>p.y-45));
  if(offsetX<0||offsetY<0){const x=-offsetX,y=-offsetY;finalPositions=Object.fromEntries(Object.entries(finalPositions).map(([k,p])=>[k,{...p,x:p.x+x,y:p.y+y}]));
   // SVG parent translates the entire drawing to accommodate negative branch offsets.
   return {nodes:finalPositions,edges:edges.map(e=>({...e,path:e.path?e.path.replace(/([ML]) (-?[\d.]+) (-?[\d.]+)/g,(_,m,ex,ey)=>`${m} ${Number(ex)+x} ${Number(ey)+y}`):e.path,labelX:e.labelX===undefined?undefined:e.labelX+x,labelY:e.labelY===undefined?undefined:e.labelY+y})),width:maxX+x,height:maxY+y,orientation:opts.orientation};
  }
  return {nodes:finalPositions,edges,width:maxX,height:maxY,orientation:opts.orientation};
 }
}
