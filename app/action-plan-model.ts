export const actionFields=[['breakpoint','The breakpoint I am taking home'],['change','The one change I will make'],['agreement','Who has to agree to it'],['deadline','By when'],['evidence','How I will know it happened']] as const;
export const actionKey='action-plan-structured';
export function parseAction(text:string){try{const obj=JSON.parse(text);return Object.fromEntries(actionFields.map(([key])=>[key,typeof obj[key]==='string'?obj[key]:'']));}catch{return Object.fromEntries(actionFields.map(([key])=>[key,'']));}}
export function actionText(data:Record<string,string>){return actionFields.map(([key,label])=>label+'\n'+(data[key]||'')).join('\n\n');}
