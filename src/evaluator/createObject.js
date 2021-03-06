import { convertLambdaToFunction, convertMacroToFunction } from "./helpers";
import Lambda from "../types/Lambda";
import Symbl from "../types/Symbl";
import Macro from "../types/Macro";

export default function createObject(Class, env, args) {
  const ctorArgs = args.map(arg => {
    if (arg instanceof Lambda) {
      return convertLambdaToFunction(arg);
    }
    if (arg instanceof Macro) {
      return convertMacroToFunction(arg, env);
    }
    if (arg instanceof Symbl) {
      return arg.name;
    }
    return arg;
  });

  return new Class(...ctorArgs);
}
