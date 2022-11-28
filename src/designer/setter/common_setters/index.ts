import React from "react";
import NumberSetter from "./number";
import StringSetter from "./string";

const setters: Record<string, React.FunctionComponent<any> | React.ComponentClass<any>> = {
  string: StringSetter,
  number: NumberSetter
}

export default setters