const Symbol = require('./Symbol');
const Lambda = require('./Lambda');
const Macro = require('./Macro');
const MethodCall = require('./MethodCall');
const parse = require('./parser');
const specialForms = require('./forms');
const SpecialForm = require('./forms/SpecialForm');
const { mergeArguments } = require('./util');
const initModules = require('./modules');

class Env {
  constructor(map = new Map(), parent) {
    this.map = map;
    this.parent = parent;
  }

  set(key, value) {
    this.map.set(key, value);
  }

  get(key) {
    if (this.map.has(key)) {
      return this.map.get(key);
    }

    if (!this.parent) {
      throw new Error(`Symbol "${key}" is not defined`);
    }

    return this.parent.get(key);
  }
}

const convertLambdaToFunction = (lambda, env) => (...args) => {
  return callLambda(lambda, env, args);
};


const convertMacroToFunction = (macro, env) => (...args) => {
  return callMacro(macro, env, args);
};


const callMethod = (method, env, obj, args) => {
  const methodArgs = args.map(arg => {
    if (arg instanceof Lambda) {
      return convertLambdaToFunction(arg, env);
    }
    if (arg instanceof Macro) {
      return convertMacroToFunction(arg, env);
    }
    return arg;
  });
  return obj[method.name].apply(obj, methodArgs);
};

const callFunction = (func, env, args) => {
  const funcArgs = args.map(arg => {
    if (arg instanceof Lambda) {
      return convertLambdaToFunction(arg, env);
    }
    if (arg instanceof Macro) {
      return convertMacroToFunction(arg, env);
    }
    return arg;
  });
  return func.apply(null, funcArgs);
};

const callLambda = (lambda, env, argValues) => {
  const argNames = lambda.args.map(arg => arg.name);
  const mergedArguments = mergeArguments(argNames, argValues);
  const lambdaEnv = new Env(mergedArguments, lambda.env);

  return evaluateEach(lambda.body, lambdaEnv);
};

const callMacro = (macro, env, argValues) => {
  const argNames = macro.args.map(arg => arg.name);
  const mergedArguments = mergeArguments(argNames, argValues);

  const expandedBody = macro.expand(mergedArguments);

  return evaluateEach(expandedBody, env);
};

const evaluateSymbol = ({ name }, env) => {
  if (name in specialForms) {
    return specialForms[name];
  }
  if (name[0] === '.') {
    return new MethodCall(name.substr(1));
  }
  return env.get(name);
};

const evaluateList = (list, env) => {
  if (list.length === 0) {
    return [];
  }

  const [head, ...tail] = list;
  const headForm = evaluate(head, env);

  if (headForm instanceof SpecialForm) {
    return headForm.perform(env, evaluate, tail);
  }

  if (headForm instanceof Lambda) {
    const evaledArgs = tail.map(arg => evaluate(arg, env));
    return callLambda(headForm, env, evaledArgs);
  }

  if (headForm instanceof Macro) {
    return callLambda(headForm, env, tail);
  }

  if (headForm instanceof MethodCall) {
    const [obj, ...args] = tail.map(exp => evaluate(exp, env));
    return callMethod(headForm, env, obj, args);
  }

  if (typeof headForm === 'function') {
    const args = tail.map(exp => evaluate(exp, env));
    return callFunction(headForm, env, args);
  }

  throw new Error(`Cound not execute - ${headForm}`);
};

const evaluateEach = (expressions, env) => {
  return expressions.reduce((result, exp) => {
    env.set('$', result);
    return evaluate(exp, env);
  }, undefined);
};

const evaluate = (expression, env) => {
  if (expression instanceof Symbol) {
    return evaluateSymbol(expression, env);
  }
  if (Array.isArray(expression)) {
    return evaluateList(expression, env);
  }
  if (expression instanceof Map) {
    return evaluateMap(expression, env);
  }
  return expression;
};

module.exports.makeEvaluator = () => {
  const env = new Env();
  initModules(env);
  return exprs => evaluateEach(exprs, env);
};
