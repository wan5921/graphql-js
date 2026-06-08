import { describe, it } from 'node:test';

import { expect } from 'chai';

import { graphql } from '../../graphql.ts';
import { GraphQLList, GraphQLNonNull } from '../../type/definition.ts';
import { GraphQLString } from '../../type/scalars.ts';

import {
  StarWarsSchema,
  characterInterface,
  humanType,
  droidType,
  queryType,
  episodeEnum,
} from '../index.ts';
import { getCharacterInterfaceFields } from '../characterFields.ts';
import { getHumanFields } from '../humanFields.ts';
import { getDroidFields } from '../droidFields.ts';
import { getQueryFields } from '../queryFields.ts';

describe('Types Module: Field Generation', () => {
  describe('episodeEnum', () => {
    it('has correct name and values', () => {
      expect(episodeEnum.name).to.equal('Episode');
      const values = episodeEnum.getValues();
      expect(values).to.have.length(3);
      expect(values[0].name).to.equal('NEW_HOPE');
      expect(values[0].value).to.equal(4);
      expect(values[1].name).to.equal('EMPIRE');
      expect(values[1].value).to.equal(5);
      expect(values[2].name).to.equal('JEDI');
      expect(values[2].value).to.equal(6);
    });
  });

  describe('characterInterface', () => {
    it('has correct name', () => {
      expect(characterInterface.name).to.equal('Character');
    });

    it('has all expected fields', () => {
      const fields = characterInterface.getFields();
      expect(fields).to.have.property('id');
      expect(fields).to.have.property('name');
      expect(fields).to.have.property('friends');
      expect(fields).to.have.property('appearsIn');
      expect(fields).to.have.property('secretBackstory');
    });

    it('id field is non-null String', () => {
      const fields = characterInterface.getFields();
      expect(fields.id.type).to.be.instanceof(GraphQLNonNull);
      expect(fields.id.type.toString()).to.equal('String!');
    });

    it('friends field is a list of Character', () => {
      const fields = characterInterface.getFields();
      expect(fields.friends.type).to.be.instanceof(GraphQLList);
      expect(fields.friends.type.toString()).to.equal('[Character]');
    });
  });

  describe('humanType', () => {
    it('has correct name', () => {
      expect(humanType.name).to.equal('Human');
    });

    it('implements Character interface', () => {
      const interfaces = humanType.getInterfaces();
      expect(interfaces).to.include(characterInterface);
    });

    it('has all expected fields including homePlanet', () => {
      const fields = humanType.getFields();
      expect(fields).to.have.property('id');
      expect(fields).to.have.property('name');
      expect(fields).to.have.property('friends');
      expect(fields).to.have.property('appearsIn');
      expect(fields).to.have.property('secretBackstory');
      expect(fields).to.have.property('homePlanet');
    });

    it('homePlanet is nullable String', () => {
      const fields = humanType.getFields();
      expect(fields.homePlanet.type).to.equal(GraphQLString);
    });
  });

  describe('droidType', () => {
    it('has correct name', () => {
      expect(droidType.name).to.equal('Droid');
    });

    it('implements Character interface', () => {
      const interfaces = droidType.getInterfaces();
      expect(interfaces).to.include(characterInterface);
    });

    it('has all expected fields including primaryFunction', () => {
      const fields = droidType.getFields();
      expect(fields).to.have.property('id');
      expect(fields).to.have.property('name');
      expect(fields).to.have.property('friends');
      expect(fields).to.have.property('appearsIn');
      expect(fields).to.have.property('secretBackstory');
      expect(fields).to.have.property('primaryFunction');
    });

    it('primaryFunction is nullable String', () => {
      const fields = droidType.getFields();
      expect(fields.primaryFunction.type).to.equal(GraphQLString);
    });
  });

  describe('queryType', () => {
    it('has correct name', () => {
      expect(queryType.name).to.equal('Query');
    });

    it('has hero, human, and droid fields', () => {
      const fields = queryType.getFields();
      expect(fields).to.have.property('hero');
      expect(fields).to.have.property('human');
      expect(fields).to.have.property('droid');
    });

    it('hero field has episode argument', () => {
      const fields = queryType.getFields();
      expect(fields.hero.args).to.have.property('episode');
    });

    it('human field has required id argument', () => {
      const fields = queryType.getFields();
      const idArg = fields.human.args.find((a: { name: string }) => a.name === 'id');
      expect(idArg).to.not.be.undefined;
      expect(idArg!.type).to.be.instanceof(GraphQLNonNull);
    });
  });

  describe('Field Config Factory Functions', () => {
    it('getCharacterInterfaceFields returns correct field keys', () => {
      const fields = getCharacterInterfaceFields(characterInterface);
      expect(Object.keys(fields)).to.deep.equal([
        'id',
        'name',
        'friends',
        'appearsIn',
        'secretBackstory',
      ]);
    });

    it('getHumanFields returns correct field keys including homePlanet', () => {
      const fields = getHumanFields(characterInterface);
      expect(Object.keys(fields)).to.include('homePlanet');
    });

    it('getDroidFields returns correct field keys including primaryFunction', () => {
      const fields = getDroidFields(characterInterface);
      expect(Object.keys(fields)).to.include('primaryFunction');
    });

    it('getQueryFields returns correct field keys', () => {
      const fields = getQueryFields(characterInterface, humanType, droidType);
      expect(Object.keys(fields)).to.deep.equal(['hero', 'human', 'droid']);
    });
  });
});

describe('Types Module: GraphQL Execution', () => {
  it('executes hero query correctly', async () => {
    const source = `
      query HeroNameQuery {
        hero {
          name
        }
      }
    `;
    const result = await graphql({ schema: StarWarsSchema, source });
    expect(result).to.deep.equal({
      data: {
        hero: {
          name: 'R2-D2',
        },
      },
    });
  });

  it('executes human query correctly', async () => {
    const source = `
      query HumanQuery {
        human(id: "1000") {
          name
          homePlanet
        }
      }
    `;
    const result = await graphql({ schema: StarWarsSchema, source });
    expect(result).to.deep.equal({
      data: {
        human: {
          name: 'Luke Skywalker',
          homePlanet: 'Tatooine',
        },
      },
    });
  });

  it('executes droid query correctly', async () => {
    const source = `
      query DroidQuery {
        droid(id: "2000") {
          name
          primaryFunction
        }
      }
    `;
    const result = await graphql({ schema: StarWarsSchema, source });
    expect(result).to.deep.equal({
      data: {
        droid: {
          name: 'C-3PO',
          primaryFunction: 'Protocol',
        },
      },
    });
  });

  it('executes nested friends query correctly', async () => {
    const source = `
      query HeroFriendsQuery {
        hero {
          name
          friends {
            name
          }
        }
      }
    `;
    const result = await graphql({ schema: StarWarsSchema, source });
    expect(result.data?.hero).to.have.property('friends');
    expect((result.data as any).hero.friends).to.have.length(3);
  });

  it('secretBackstory throws error', async () => {
    const source = `
      query SecretQuery {
        hero {
          name
          secretBackstory
        }
      }
    `;
    const result = await graphql({ schema: StarWarsSchema, source });
    expect(result.data?.hero).to.have.property('name');
    expect(result.errors).to.have.length(1);
    expect(result.errors![0].message).to.equal('secretBackstory is secret.');
  });
});
