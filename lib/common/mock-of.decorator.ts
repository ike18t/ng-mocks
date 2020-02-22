import { Type } from '@angular/core';

// This helps with debugging in the browser. Decorating mock classes with this
// will change the display-name of the class to 'MockOf-<ClassName>` so our
// debugging output (and Angular's error messages) will mention our mock classes
// by name (which will now include the original class' name.
// Additionally, if we set breakpoints, we can inspect the actual class being mocked
// by looking into the 'mockOf' property on the class.
/* tslint:disable-next-line variable-name */
export const MockOf = (mockClass: Type<any>, outputs?: string[]) => (constructor: Type<any>) => {
  Object.defineProperties(constructor, {
    mockOf: {value: mockClass},
    name: {value: `MockOf${mockClass.name}`},
    nameConstructor: {value: constructor.name},
  });

  const mockedMethods = [];
  for (const method of Object.getOwnPropertyNames(mockClass.prototype || {})) {
    // Skipping getters and setters
    const descriptor = Object.getOwnPropertyDescriptor(mockClass.prototype, method);
    const isGetterSetter = descriptor && (descriptor.get || descriptor.set);
    if (!isGetterSetter && !constructor.prototype[method]) {
      mockedMethods.push(method);
    }
  }

  const mockedOutputs = [];
  for (const output of outputs || []) {
    mockedOutputs.push(output.split(':')[0]);
  }

  constructor.prototype.__mockedMethods = mockedMethods;
  constructor.prototype.__mockedOutputs = mockedOutputs;
};
