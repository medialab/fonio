const validStories = [
    require('../../mocks/test-qui-va-bien.json')
];
const invalidStories = [
  Object.assign({}, validStories[0],
    {resources: undefined})
];

import {expect} from 'chai';

import validate from './storyValidator';

describe('storyValidator', () => {
  it('should successfully parse valid stories', done => {
    validStories.forEach(story => {
      const validated = validate(story);
      return expect(validated).to.be.true;
    });
    done();
  });

  it('should successfully parse stories with missing titles', done => {

    done();
  });

  it('should refuse stories with missing fields', done => {
    invalidStories.forEach(story => {
      const validated = validate(story);
      return expect(validated).to.be.false;
    });
    done();
  });

  // todo
  // it('should refuse stories with non-matching uuids', done => {
  //   done();
  // });


  // it('', done => {
  //  done();
  // });
});

