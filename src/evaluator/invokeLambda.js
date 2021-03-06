import { size } from "lodash";
import mergeArgs from "./mergeArgs";
import evaluate from "./evaluate";
import Env from "./env/Env";
import LambdaCall from "../types/LambdaCall";
import Lambda from "../types/Lambda";
import DotPunctuator from "../types/DotPunctuator";

export function canApplyAutoCurrying(lambda) {
  return !lambda.args.some(arg => arg instanceof DotPunctuator);
}

const hasUnboundSymbols = (lambdaArgs, argValues) =>
  lambdaArgs.length > argValues.length;

export default function invokeLambda(lambda, argValues, strict = true) {
  const argValuesSize = size(argValues);

  if (
    canApplyAutoCurrying(lambda) &&
    hasUnboundSymbols(lambda.args, argValues)
  ) {
    const boundFrame = mergeArgs(
      lambda.args.slice(0, argValuesSize),
      argValues
    );
    const unboundArgNames = lambda.args.slice(argValuesSize);

    return new Lambda(
      unboundArgNames,
      lambda.body,
      new Env(boundFrame, lambda.env)
    );
  }

  const frame = mergeArgs(lambda.args, argValues);

  let result = new LambdaCall(lambda, frame);

  if (strict) {
    while (result instanceof LambdaCall) {
      const lambdaEnv = new Env(result.frame, result.lambda.env);
      result = evaluate(result.lambda.body, lambdaEnv, false);
    }
  }

  return result;
}
