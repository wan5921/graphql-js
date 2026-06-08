import { describe, it } from 'node:test';

import { expect } from 'chai';

import { graphql } from '../graphql.ts';

import {
  StarWarsSchema,
  characterInterface,
  droidType,
  humanType,
  queryType,
} from './starWarsSchema.ts';

describe('Star Wars schema field generation', () => {
  it('builds fields from modular type configuration files', () => {
    expect(Object.keys(characterInterface.getFields())).to.deep.equal([
      'id',
      'name',
      'friends',
      'appearsIn',
      'secretBackstory',
    ]);
    expect(Object.keys(humanType.getFields())).to.deep.equal([
      'id',
      'name',
      'friends',
      'appearsIn',
      'homePlanet',
      'secretBackstory',
    ]);
    expect(Object.keys(droidType.getFields())).to.deep.equal([
      'id',
      'name',
      'friends',
      'appearsIn',
      'secretBackstory',
      'primaryFunction',
    ]);
    expect(Object.keys(queryType.getFields())).to.deep.equal([
      'hero',
      'human',
      'droid',
    ]);

    expect(humanType.getFields().id.description).to.equal('The id of the human.');
    expect(humanType.getFields().friends.type.toString()).to.equal('[Character]');
    expect(droidType.getFields().appearsIn.description).to.equal(
      'Which movies they appear in.',
    );
    expect(queryType.getFields().hero.args.map((arg) => arg.name)).to.deep.equal([
      'episode',
    ]);
    expect(queryType.getFields().human.args.map((arg) => arg.name)).to.deep.equal([
      'id',
    ]);
  });

  it('keeps generated fields executable in the core GraphQL flow', async () => {
    const result = await graphql({
      schema: StarWarsSchema,
      source: `
        {
          hero {
            __typename
            ... on Droid {
              primaryFunction
            }
          }
        }
      `,
    });

    expect(result).to.deep.equal({
      data: {
        hero: {
          __typename: 'Droid',
          primaryFunction: 'Astromech',
        },
      },
    });
  });
});
