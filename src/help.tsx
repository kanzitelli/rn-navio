import {BaseOptions, BaseOptionsProps} from './types';

export const safeOpts =
  (opts: BaseOptions<any> | BaseOptions<any>[]) => (props: BaseOptionsProps) => {
    if (Array.isArray(opts)) {
      let all_opts = {};
      for (const opt of opts) {
        all_opts = {
          ...all_opts,
          ...safeOpts(opt)(props),
        };
      }
      return all_opts;
    }

    return typeof opts === 'function' ? opts(props) : opts;
  };
