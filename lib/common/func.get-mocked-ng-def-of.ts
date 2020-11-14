import { MockedComponent } from '../mock-component/types';
import { MockedDirective } from '../mock-directive/types';
import { MockedModule } from '../mock-module/types';
import { MockedPipe } from '../mock-pipe/types';

import { getTestBedInjection } from './core.helpers';
import { NG_MOCKS } from './core.tokens';
import { Type } from './core.types';
import { isMockedNgDefOf } from './func.is-mocked-ng-def-of';
import ngMocksUniverse from './ng-mocks-universe';

/**
 * Returns a def of a mock module based on a mock module or a source module.
 *
 * @see https://github.com/ike18t/ng-mocks#getmockedngdefof
 */
export function getMockedNgDefOf<T>(declaration: Type<T>, type: 'm'): Type<MockedModule<T>>;

/**
 * Returns a def of a mock component based on a mock component or a source component.
 *
 * @see https://github.com/ike18t/ng-mocks#getmockedngdefof
 */
export function getMockedNgDefOf<T>(declaration: Type<T>, type: 'c'): Type<MockedComponent<T>>;

/**
 * Returns a def of a mock directive based on a mock directive or a source directive.
 *
 * @see https://github.com/ike18t/ng-mocks#getmockedngdefof
 */
export function getMockedNgDefOf<T>(declaration: Type<T>, type: 'd'): Type<MockedDirective<T>>;

/**
 * Returns a def of a mock pipe based on a mock pipe or a source pipe.
 *
 * @see https://github.com/ike18t/ng-mocks#getmockedngdefof
 */
export function getMockedNgDefOf<T>(declaration: Type<T>, type: 'p'): Type<MockedPipe<T>>;

/**
 * Returns a def of a mock class based on a mock class or a source class decorated by a ng type.
 *
 * @see https://github.com/ike18t/ng-mocks#getmockedngdefof
 */
export function getMockedNgDefOf(declaration: Type<any>): Type<any>;

export function getMockedNgDefOf(declaration: any, type?: any): any {
  const source = declaration.mockOf ? declaration.mockOf : declaration;
  const mocks = getTestBedInjection(NG_MOCKS);

  let mock: any;

  // If mocks exists, we are in the MockBuilder env and it's enough for the check.
  if (mocks && mocks.has(source)) {
    mock = mocks.get(source);
  } else if (mocks) {
    throw new Error(`There is no mock for ${source.name}`);
  }

  // If we are not in the MockBuilder env we can rely on the current cache.
  if (!mock && source !== declaration) {
    mock = declaration;
  } else if (!mock && ngMocksUniverse.cacheDeclarations.has(source)) {
    mock = ngMocksUniverse.cacheDeclarations.get(source);
  }

  if (mock && !type) {
    return mock;
  }
  if (mock && type && isMockedNgDefOf(mock, source, type)) {
    return mock;
  }

  // Looks like the def hasn't been replaced with its mock copy.
  throw new Error(`There is no mock for ${source.name}`);
}