import nisp from "nisp";
import args from "nisp/lib/args";
import { parse } from "nisp/parser";
import moment from "moment";

var sandbox = {
  $: function(variableName) {
    return this.env[variableName];
  },
  now: () => new Date(),
  rand: () => Math.random(),
  str: (...args) => args.map(x => x.toString()).join(""),
  formatDate: (date, format) => moment(date).format(format),
  case: args(v => {
    const value = v(0);
    let index = 0;
    while (true) {
      let valueToMatch = v(index + 1);
      if (value === valueToMatch) {
        return v(index + 2);
      }
      if (v(index + 2) === undefined) {
        return;
      }
      index += 2;
    }
  })
};

function evaluate(exp, env) {
  return typeof exp === "string"
    ? nisp(parse(exp), sandbox, env)
    : nisp(exp, sandbox, env);
}
const defaultExpr = `(case ($ jobType)
  'Automation' (str 'A' ($ jobNumber))
  'Maintenance' (str 'M' ($ jobNumber))
  'Service' (str '5' ($ jobNumber))
  'Quoted' (str (formatDate (now) 'YY') ($ jobNumber)))`;

document.getElementById("expr").value = defaultExpr;

var editor = CodeMirror.fromTextArea(document.getElementById("expr"), {
  lineNumbers: true
});

function computeCustomerProvidedJobNumber() {
  const jobTypeElement = document.getElementById("jobType");
  const jobType = jobTypeElement.options[jobTypeElement.selectedIndex].value;
  const jobNumber = parseInt(document.getElementById("jobNumber").value);
  const customerProvidedJobNumber = evaluate(editor.getValue(), {
    jobNumber: jobNumber,
    jobType: jobType
  });
  document.getElementById(
    "customerProvidedJobNumber"
  ).value = customerProvidedJobNumber;
}
document
  .getElementById("compute")
  .addEventListener("click", computeCustomerProvidedJobNumber);
computeCustomerProvidedJobNumber();
