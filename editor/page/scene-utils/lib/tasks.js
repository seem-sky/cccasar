const s=require("async");let t={_stashArray:null,init(){this.silence=!0,this._genTaskID=-1,this._queue=s.queue((s,t)=>{let i=function(i){i?this._handleError(s,i):this.silence||Editor.log(`Finish task ${s.name}`),t.apply(null,arguments)}.bind(this),e=s.params||[];e.push(i);let r=s.target||this;s.id=++this._genTaskID%100;try{this.silence||Editor.log(`Handling task ${s.name}`),s.run.apply(r,e)}catch(i){this._handleError(s,i),t(i)}})},stash(){this._stashArray=[]},unshiftStash(){var s=this._stashArray;if(s){for(let t=s.length-1;t>=0;t--)this._queue.unshift(s[t][0],s[t][1]);this._stashArray=null}},push(s,t){this.silence||Editor.log(`Push task ${s.name}`),this._stashArray?this._stashArray.push([s,t]):this._queue.push(s,t)},kill(){this._queue.kill()},_handleError(s,t){Editor.failed(`Task [${s.name}] run error, stop running other tasks.\n ${t.stack||t}`),this.kill()},get runningTask(){let s=this._queue.workersList();return s.length>0?s[0].data:null}};t.init(),module.exports=t;