import { getSourceOfMock } from '../../common/func.get-source-of-mock';
import mockHelperCrawl from '../crawl/mock-helper.crawl';
import mockHelperFind from '../find/mock-helper.find';
import funcGetFromNode from '../func.get-from-node';
import funcGetLastFixture from '../func.get-last-fixture';
import funcParseFindArgs from '../func.parse-find-args';
import funcParseFindArgsName from '../func.parse-find-args-name';

import funcIsValidFindInstanceSelector from './func.is-valid-find-instance-selector';

const defaultNotFoundValue = {}; // simulating Symbol

export default (...args: any[]) => {
  const [el, sel, notFoundValue] = funcParseFindArgs(args, funcIsValidFindInstanceSelector, defaultNotFoundValue);
  if (typeof sel !== 'function') {
    throw new Error('Only classes are accepted');
  }

  const declaration = getSourceOfMock(sel);
  const result: any[] = [];
  mockHelperCrawl(
    mockHelperFind(funcGetLastFixture(), el, undefined),
    node => {
      funcGetFromNode(result, node, declaration);

      return result.length > 0;
    },
    true,
  );
  if (result.length) {
    return result[0];
  }
  if (notFoundValue !== defaultNotFoundValue) {
    return notFoundValue;
  }
  throw new Error(`Cannot find an instance via ngMocks.findInstance(${funcParseFindArgsName(sel)})`);
};
