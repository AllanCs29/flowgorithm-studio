import { FlowProject, FlowNode, functionId, nodeId, projectId } from './models';

const nodes: Record<string, FlowNode> = {
  start: { id: nodeId('start'), type: 'Start', next: nodeId('declare') },
  declare: { id: nodeId('declare'), type: 'Declare', name: 'edad', dataType: 'Integer', next: nodeId('input') },
  input: { id: nodeId('input'), type: 'Input', target: 'edad', next: nodeId('condition') },
  condition: { id: nodeId('condition'), type: 'If', condition: 'edad >= 18', trueNext: nodeId('adult'), falseNext: nodeId('minor'), next: nodeId('end') },
  adult: { id: nodeId('adult'), type: 'Output', expression: '"Eres mayor de edad"', newLine: true },
  minor: { id: nodeId('minor'), type: 'Output', expression: '"Eres menor de edad"', newLine: true },
  end: { id: nodeId('end'), type: 'End' }
};

export const sampleProject: FlowProject = {
  id: projectId('sample'), metadata: { title: 'Mi primer diagrama', author: '', version: '1.0' }, mainFunctionId: functionId('main'),
  functions: { main: { id: functionId('main'), name: 'Main', parameters: [], nodes, rootNodeId: nodeId('start') } }
};