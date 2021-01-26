import { IActionRunInfo, isAction, _startAction, _endAction } from 'mobx';
import {
  TraceState,
  Thread,
  FlowupOptions,
  flowup as originalFlowup,
  FlowOptions,
  SafeFlowCreator,
  flow as originalFlow,
  Plugin,
} from './original';

export * from 'safe-flow';

class MobxPlugin implements Plugin {
  currInfo: IActionRunInfo | undefined = undefined;
  onState(state: TraceState, thread: Thread) {
    const { parent, name, func } = thread;
    if (state === TraceState.thread_starting) {
      this.endAction();
      if (!isAction(func)) {
        this.currInfo = _startAction(name ? name : 'unknow', false, undefined);
      }
    } else if (state === TraceState.thread_idle) {
      if (!isAction(func)) {
        this.endAction();
      }
    } else if (state === TraceState.thread_completed) {
      this.endAction();
      if (parent && !parent.hasChildren) {
        const { name } = parent;
        this.currInfo = this.startAction(
          name ? name : 'unknow',
          false,
          undefined
        );
      }
    }
  }
  startAction(...args: Parameters<typeof _startAction>) {
    return _startAction(...args);
  }
  endAction() {
    if (this.currInfo) {
      _endAction(this.currInfo);
      this.currInfo = undefined;
    }
  }
}
const plugin: MobxPlugin = new MobxPlugin();

export function flowup<T = any>(target: T, options?: FlowupOptions) {
  if (options) {
    options.plugins = options.plugins
      ? [plugin as Plugin].concat(options.plugins)
      : [plugin];
  } else {
    options = { plugins: [plugin] };
  }
  return originalFlowup(target, options);
}

export function flow<TReturn = any, TParam extends any[] = any>(
  func: (...args: TParam) => Promise<TReturn>,
  options?: FlowOptions
): SafeFlowCreator<TReturn, ThisParameterType<typeof func>, TParam> {
  if (options) {
    options.plugins = options.plugins
      ? [plugin as Plugin].concat(options.plugins)
      : [plugin];
  } else {
    options = { plugins: [plugin] };
  }
  return originalFlow(func, options);
}
