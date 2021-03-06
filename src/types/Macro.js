import Symbl from "./Symbl";

export default class Macro {
  constructor(args, body) {
    this.args = args;
    this.body = body;
  }

  expand(args) {
    const _expand = body => {
      if (Array.isArray(body)) {
        return body.map(exp => _expand(exp));
      }
      if (body instanceof Symbl && args.has(body.name)) {
        return args.get(body.name);
      }
      return body;
    };

    return _expand(this.body);
  }
}
