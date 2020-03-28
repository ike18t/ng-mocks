[![Build Status](https://travis-ci.org/ike18t/ng-mocks.png?branch=master)](https://travis-ci.org/ike18t/ng-mocks)
[![npm version](https://badge.fury.io/js/ng-mocks.svg)](https://badge.fury.io/js/ng-mocks)

# ngMocks
Helper function for creating angular mocks for test.

## Why use this?
Sure, you could flip a flag on schema errors to make your component dependencies not matter.  Or you could use this to mock them out and have the ability to assert on their inputs or emit on an output to assert on a side effect.

For an easy start check the [MockBuilder](#MockBuilder) first.

### Sections:

* [MockModule](#mockmodule)
* [MockComponent](#mockcomponents)
* [MockDirective](#mockdirectives)
* [MockPipe](#mockpipes)
* [MockDeclaration](#mockdeclarations)
- [MockBuilder](#mockbuilder) - facilitate creation of a mocked environment
- [MockRender](#mockrender) - facilitate render of components 
- [MockHelper](#mockhelper) - facilitate extraction of directives of an element
* [Reactive Forms Components](#mocked-reactive-forms-components)
* [Structural Components](#usage-example-of-structural-directives)
* [More examples](#other-examples-of-tests)

---

## MockComponent(s)

- Mocked component with the same selector
- Inputs and Outputs with alias support
- Each component instance has its own EventEmitter instances for outputs
- Mocked component templates are `ng-content` tags to allow transclusion
- When `@ContentChild` is present, then all of them will be wrapped as `[data-key="_id_"]`
  and `ng-content` with `[data-key="ng-content"]`
- Allows ng-model binding (You will have to add FormsModule to TestBed imports)
- Mocks Reactive Forms (You will have to add ReactiveFormsModule to TestBed imports)
    - __simulateChange - calls `onChanged` on the mocked component bound to a FormControl
    - __simulateTouch - calls `onTouched` on the mocked component bound to a FormControl
- exportAs support

<details><summary>Click to see <strong>a usage example</strong></summary>
<p>

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MockComponent, MockedComponent, MockRender } from 'ng-mocks';

describe('MockComponent', () => {
  let fixture: ComponentFixture<TestedComponent>;
  let component: TestedComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        TestedComponent,
        MockComponent(DependencyComponent),
      ]
    });

    fixture = TestBed.createComponent(TestedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should send the correct value to the dependency component input', () => {
    const mockedComponent = fixture.debugElement
      .query(By.css('dependency-component-selector'))
      .componentInstance as DependencyComponent; // casting to retain type safety

    // let's pretend Dependency Component (unmocked) has 'someInput' as an input
    // the input value will be passed into the mocked component so you can assert on it
    component.value = 'foo';
    fixture.detectChanges();

    // if you casted mockedComponent as the original component type then this is type safe
    expect(mockedComponent.someInput).toEqual('foo');
  });

  it('should do something when the dependency component emits on its output', () => {
    spyOn(component, 'trigger');
    const mockedComponent = fixture.debugElement
      .query(By.directive(DependencyComponent))
      .componentInstance as DependencyComponent; // casting to retain type safety

    // again, let's pretend DependencyComponent has an output called 'someOutput'
    // emit on the output that MockComponent setup when generating the mock of Dependency Component
    // if you casted mockedComponent as the original component type then this is type safe
    mockedComponent.someOutput.emit({
      payload: 'foo',
    });

    // assert on some side effect
    expect(component.trigger).toHaveBeenCalledWith({
      payload: 'foo',
    });
  });

  it('should render something inside of the dependency component', () => {
    const localFixture = MockRender(`
      <dependency-component-selector>
        <p>inside content</p>
      </dependency-component-selector>
    `);
    // because component does not have any @ContentChild we can access html directly.
    // assert on some side effect
    const mockedNgContent = localFixture.debugElement
      .query(By.directive(DependencyComponent))
      .nativeElement.innerHTML;
    expect(mockedNgContent).toContain('<p>inside content</p>');
  });

  it('should render something inside of the dependency component', () => {
    const localFixture = MockRender(`
      <dependency-component-selector>
        <ng-template #something><p>inside template</p></ng-template>
        <p>inside content</p>
      </dependency-component-selector>
    `);

    // injected ng-content stays as it was.
    const mockedNgContent = localFixture.debugElement
      .query(By.directive(DependencyComponent))
      .nativeElement.innerHTML;
    expect(mockedNgContent).toContain('<p>inside content</p>');

    // because component does have @ContentChild we need to render them first with proper context.
    const mockedElement = localFixture.debugElement.query(By.directive(DependencyComponent));
    const mockedComponent: MockedComponent<DependencyComponent> = mockedElement.componentInstance;
    mockedComponent.__render('something');
    localFixture.detectChanges();

    const mockedNgTemplate = mockedElement.query(By.css('[data-key="something"]'))
      .nativeElement.innerHTML;
    expect(mockedNgTemplate).toContain('<p>inside template</p>');
  });
});
```

</p>
</details>

---

## MockDirective(s)

* Mocked directive with the same selector
* Inputs and Outputs with alias support
* Each directive instance has its own EventEmitter instances for outputs
* exportAs support

<details><summary>Click to see <strong>a usage example</strong> of Attribute Directives</summary>
<p>

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MockDirective, MockHelper } from 'ng-mocks';

describe('MockDirective', () => {
  let fixture: ComponentFixture<TestedComponent>;
  let component: TestedComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        TestedComponent,
        MockDirective(DependencyDirective),
      ]
    });

    fixture = TestBed.createComponent(TestedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should send the correct value to the dependency component input', () => {
    component.value = 'foo';
    fixture.detectChanges();

    // let's pretend Dependency Directive (unmocked) has 'someInput' as an input
    // the input value will be passed into the mocked directive so you can assert on it
    const mockedDirectiveInstance = MockHelper.getDirective(
      fixture.debugElement.query(By.css('span')),
      DependencyDirective,
    );
    expect(mockedDirectiveInstance).toBeTruthy();
    if (mockedDirectiveInstance) {
      expect(mockedDirectiveInstance.someInput).toEqual('foo');
    }
    // assert on some side effect
  });

  it('should do something when the dependency directive emits on its output', () => {
    spyOn(component, 'trigger');
    fixture.detectChanges();

    // again, let's pretend DependencyDirective has an output called 'someOutput'
    // emit on the output that MockDirective setup when generating the mock of Dependency Directive
    const mockedDirectiveInstance = MockHelper.getDirective(
      fixture.debugElement.query(By.css('span')),
      DependencyDirective,
    );
    expect(mockedDirectiveInstance).toBeTruthy();
    if (mockedDirectiveInstance) {
      mockedDirectiveInstance.someOutput.emit({
        payload: 'foo',
      }); // if you casted mockedDirective as the original component type then this is type safe
    }
    // assert on some side effect
  });
});
```

</p>
</details>

<details><summary>Click to see <strong>a usage example</strong> of Structural Directives</summary>
<p>

It's important to render a structural directive first with the right context,
when assertions should be done on its nested elements.
```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockDirective, MockedDirective, MockHelper } from 'ng-mocks';

describe('MockDirective', () => {
  let fixture: ComponentFixture<TestedComponent>;
  let component: TestedComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        TestedComponent,
        MockDirective(DependencyDirective),
      ]
    });

    fixture = TestBed.createComponent(TestedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should send the correct value to the dependency component input', () => {
    component.value = 'foo';
    fixture.detectChanges();

    // IMPORTANT: by default structural directives aren't rendered.
    // Because we can't automatically detect when and with which context they should be rendered.
    // Usually developer knows context and can render it manually with proper setup.
    const mockedDirectiveInstance = MockHelper.findDirective(
      fixture.debugElement, DependencyDirective
    ) as MockedDirective<DependencyDirective>;

    // now we assert that nothing has been rendered inside of the structural directive by default.
    expect(fixture.debugElement.nativeElement.innerText).not.toContain('content');

    // and now we render it manually.
    mockedDirectiveInstance.__render();
    expect(fixture.debugElement.nativeElement.innerText).toContain('content');

    // let's pretend Dependency Directive (unmocked) has 'someInput' as an input
    // the input value will be passed into the mocked directive so you can assert on it
    expect(mockedDirectiveInstance).toBeTruthy();
    if (mockedDirectiveInstance) {
      expect(mockedDirectiveInstance.someInput).toEqual('foo');
    }
    // assert on some side effect
  });
});
```

</p>
</details>

---

## MockPipe(s)

* Mocked pipe with the same name.
* Ability to override the transform function with a type-safe function
* Default transform is () => undefined to prevent problems with chaining

Personally, I found the best thing to do for assertions is to override the transform to write the args so that I can assert on the arguments.


<details><summary>Click to see <strong>a usage example</strong></summary>
<p>

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MockPipe } from 'ng-mocks';

describe('MockPipe', () => {
  let fixture: ComponentFixture<TestedComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        TestedComponent,

        // alternatively you can use MockPipes to mock multiple but you lose the ability to override
        MockPipe(DependencyPipe, (...args) => JSON.stringify(args)),
      ]
    });

    fixture = TestBed.createComponent(TestedComponent);
    fixture.detectChanges();
  });

  describe('with transform override', () => {
    it('should return the result of the provided transform function', () => {
      expect(fixture.debugElement.query(By.css('span')).nativeElement.innerHTML).toEqual('["foo"]');
    });
  });
});
```

</p>
</details>

---

## Mocked Reactive Forms Components

- Set value on the formControl by calling __simulateChange
- Set touched on the formControl by calling __simulateTouch
- Use the `MockedComponent` type to stay typesafe: `MockedComponent<YourReactiveFormComponent>`

<details><summary>Click to see <strong>a usage example</strong></summary>
<p>

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { MockComponent, MockedComponent } from 'ng-mocks';

describe('MockReactiveForms', () => {
  let fixture: ComponentFixture<TestedComponent>;
  let component: TestedComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        TestedComponent,
        MockComponent(DependencyComponent),
      ],
      imports: [
        ReactiveFormsModule,
      ],
    });

    fixture = TestBed.createComponent(TestedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should send the correct value to the dependency component input', () => {
    const mockedReactiveFormComponent = fixture.debugElement
      .query(By.css('dependency-component-selector'))
      .componentInstance as MockedComponent<DependencyComponent>; // casting to retain type safety

    mockedReactiveFormComponent.__simulateChange('foo');
    expect(component.formControl.value).toBe('foo');
  });
});
```

</p>
</details>

---

## MockDeclaration(s)

It figures out if it is a component, directive, or pipe and mocks it for you

---

## MockModule
  * Mocks all components, directives, and pipes using MockDeclaration
  * Providers are all mocked as empty objects
  * Module Dependencies are also mocked

For providers I typically will use TestBed.get(SomeProvider) and extend it using a library like [ts-mocks](https://www.npmjs.com/package/ts-mocks).

<details><summary>Click to see <strong>a usage example</strong></summary>
<p>

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockModule } from 'ng-mocks';

describe('MockModule', () => {
  let fixture: ComponentFixture<TestedComponent>;
  let component: TestedComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        TestedComponent,
      ],
      imports: [
        MockModule(DependencyModule),
      ],
    });

    fixture = TestBed.createComponent(TestedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renders nothing without any error', () => {
    expect(component).toBeTruthy();
  });
});
```

</p>
</details>

---

## MockBuilder

The simplest way to mock everything, but not the component for testing is usage of `MockBuilder`.
Check `examples/MockBuilder/` for real examples. It's useful together with [MockRender](#MockRender).

<details><summary>Click to see <strong>a usage example</strong></summary>
<p>

```typescript
import { TestBed } from '@angular/core/testing';
import { MockBuilder, MockRender } from 'ng-mocks';

describe('MockBuilder:simple', () => {
  beforeEach(async () => {
    const ngModule = MockBuilder(MyComponent, MyModule)
      // mocking configuration here
      .build();
    // now ngModule is 
    // {
    //   imports: [MockModule(MyModule)], // but MyComponent wasn't mocked for the testing purposes. 
    // }
    // and we can simply pass it to the TestBed.
    return TestBed.configureTestingModule(ngModule).compileComponents();
  });

  it('should render content ignoring all dependencies', () => {
    const fixture = MockRender(MyComponent);
    expect(fixture).toBeDefined();
    expect(fixture.debugElement.nativeElement.innerHTML).toContain('<div>My Content</div>');
  });
});
```

</p>
</details>

<details><summary>Click to see <strong>a detailed information</strong></summary>
<p>

```typescript
import { MockBuilder } from 'ng-mocks';

// Mocks everything in MyModule (imports, declarations, providers)
// but keeps MyComponent as it is.
const ngModule = MockBuilder(MyComponent, MyModule).build();

// The same as code above.
const ngModule = MockBuilder().keep(MyComponent, {export: true}).mock(MyModule).build();

// If we want to keep a module, component, directive, pipe or provider as it is (not mocking).
// We should use .keep.
const ngModule = MockBuilder(MyComponent, MyModule)
  .keep(SomeModule)
  .keep(SomeComponent)
  .keep(SomeDirective)
  .keep(SomePipe)
  .keep(SomeDependency)
  .keep(SomeInjectionToken)
  .build()
;

// If we want to mock something, even a part of a kept module we should use .mock.
const ngModule = MockBuilder(MyComponent, MyModule)
  .mock(SomeModule)
  .mock(SomeComponent)
  .mock(SomeDirective)
  .mock(SomePipe)
  .mock(SomeDependency)
  .mock(SomeInjectionToken)
  .build()
;

// If we want to replace something with something we should use .replace.
// The replacement has to be decorated with the same decorator as the source.
// It's impossible to replace a provider or a service, we should use .provide or .mock for that.
const ngModule = MockBuilder(MyComponent, MyModule)
  .replace(HttpClientModule, HttpClientTestingModule)
  .replace(SomeComponent, SomeOtherComponent)
  .replace(SomeDirective, SomeOtherDirective)
  .replace(SomePipe, SomeOtherPipe)
  .build()
;

// For pipes we can set its handler as the 2nd parameter of .mock too.
const ngModule = MockBuilder(MyComponent, MyModule)
  .mock(SomePipe, (value) => 'My Custom Content')
  .build()
;

// If we want to add or replace a provider or a service we should use .provide.
// It has the same interface as a regular provider.
const ngModule = MockBuilder(MyComponent, MyModule)
  .provide(MyService)
  .provide([SomeService1, SomeService2])
  .provide({provide: SomeComponent3, useValue: anything1})
  .provide({provide: SOME_TOKEN, useFactory: () => anything2})
  .build()
;

// If we need to mock, or to use useValue we can use .mock for that.
const ngModule = MockBuilder(MyComponent, MyModule)
  .mock(MyService)
  .mock(SomeService1)
  .mock(SomeService2)
  .mock(SomeComponent3, anything1)
  .mock(SOME_TOKEN, anything2)
  .build()
;

// Anytime we can change our decision.
// The last action on the same object wins.
const ngModule = MockBuilder(MyComponent, MyModule)
  .keep(SomeModule)
  .mock(SomeModule)
  .keep(SomeModule)
  .mock(SomeModule)
  .build()
;

// If we want to test a component, directive or pipe which wasn't exported
// we should mark it as an 'export'.
// Doesn't matter how deep it is. It will be exported to the level of TestingModule.
const ngModule = MockBuilder(MyComponent, MyModule)
  .keep(SomeModuleComponentDirectivePipeProvider1, {
    export: true,
  })
  .build()
;

// By default all definitions (kept and mocked) are added to the TestingModule
// if they are not dependency of another definition.
// Modules are added as imports to the TestingModule.
// Components, Directive, Pipes are added as declarations to the TestingModule.
// Providers and Services are added as providers to the TestingModule.
// If we don't want something to be added to the TestingModule at all
// we should mark it as a 'dependency'.
const ngModule = MockBuilder(MyComponent, MyModule)
  .keep(SomeModuleComponentDirectivePipeProvider1, {
    dependency: true,
  })
  .mock(SomeModuleComponentDirectivePipeProvider1, {
    dependency: true,
  })
  .replace(SomeModuleComponentDirectivePipeProvider1, anything1, {
    dependency: true,
  })
  .build()
;

// Imagine we want to render a structural directive by default.
// Now we can do that via adding a 'render' flag in its config.
const ngModule = MockBuilder(MyComponent, MyModule)
  .mock(MyDirective, {
    render: true,
  })
  .build()
;

// Imagine the directive has own context and variables.
// Then instead of flag we can set its context.
const ngModule = MockBuilder(MyComponent, MyModule)
  .mock(MyDirective, {
    render: {
      $implicit: something1,
      variables: {something2: something3}
    },
  })
  .build()
;

// If we use ContentChild in a component and we want to render it by default too
// we should use its id for that in the same way as for a mocked directive.
const ngModule = MockBuilder(MyComponent, MyModule)
  .mock(MyDirective, {
    render: {
      blockId: true,
      blockWithContext: {
        $implicit: something1,
        variables: {something2: something3}
      },
    },
  })
  .build()
;
```

</p>
</details>

---

## MockRender
Providers simple way to render anything, change `@Inputs` and `@Outputs` of testing component, directives etc.

<details><summary>Click to see <strong>a usage example</strong></summary>
<p>

```typescript
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MockModule, MockRender } from 'ng-mocks';

describe('MockRender', () => {

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        TestedComponent,
      ],
      imports: [
        MockModule(DependencyModule),
      ],
    });
  });

  it('renders template', () => {
    const spy = jasmine.createSpy();
    const fixture = MockRender(
      `
        <tested (trigger)="myListener1($event)" [value1]="myParam1" value2="check">
          <ng-template #header>
            something as ng-template
          </ng-template>
          something as ng-content
        </tested>
      `,
      {
        myListener1: spy,
        myParam1: 'something1',
      }
    );

    // assert on some side effect
    const componentInstance = fixture.debugElement.query(By.directive(TestedComponent))
      .componentInstance as TestedComponent;
    componentInstance.trigger.emit('foo1');
    expect(componentInstance.value1).toEqual('something1');
    expect(componentInstance.value2).toEqual('check');
    expect(spy).toHaveBeenCalledWith('foo1');
  });

  it('renders component', () => {
    const spy = jasmine.createSpy();
    // generates template like:
    // <tested [value1]="value1" [value2]="value2" (trigger)="trigger"></tested>
    // and returns fixture with a component with properties value1, value2 and empty callback trigger.
    const fixture = MockRender(TestedComponent, {
      trigger: spy,
      value1: 'something2',
    });

    // assert on some side effect
    const componentInstance = fixture.debugElement.query(By.directive(TestedComponent))
      .componentInstance as TestedComponent;
    componentInstance.trigger.emit('foo2');
    expect(componentInstance.value1).toEqual('something2');
    expect(componentInstance.value2).toBeUndefined();
    expect(spy).toHaveBeenCalledWith('foo2');
  });
});
```

</p>
</details>

---

## MockHelper

MockHelper provides 3 methods to get attribute and structural directives from an element. 

`MockHelper.getDirective(fixture.debugElement, Directive)` -
returns attribute or structural directive which belongs to current element.

`MockHelper.findDirective(fixture.debugElement, Directive)` -
returns first found attribute or structural directive which belongs to current element or any child.

`MockHelper.findDirectives(fixture.debugElement, Directive)`
returns all found attribute or structural directives which belong to current element and all its child.

---

## Other examples of tests

More detailed examples can be found in
[e2e](https://github.com/ike18t/ng-mocks/tree/master/e2e)
and in
[examples](https://github.com/ike18t/ng-mocks/tree/master/examples)
directories in the repo.

---

## Find an issue or have a request?
Report it as an issue or submit a PR.  I'm open to contributions.

<https://github.com/ike18t/ng-mocks>
