import { describe, it } from 'node:test';

import { expect } from 'chai';

import {
  GraphQLObjectType,
  GraphQLInterfaceType,
  GraphQLEnumType,
  GraphQLNonNull,
  GraphQLList,
} from '../../type/definition.ts';
import { GraphQLString } from '../../type/scalars.ts';

import { StarWarsSchema } from '../../__tests__/starWarsSchema.ts';
import { graphqlSync } from '../../graphql.ts';

import { buildCharacterFields } from '../starWars/character.ts';
import { buildHumanFields } from '../starWars/human.ts';
import { buildDroidFields } from '../starWars/droid.ts';
import { buildQueryFields } from '../starWars/query.ts';

describe('StarWars Type Configs', () => {
  const episodeEnum = new GraphQLEnumType({
    name: 'Episode',
    description: 'One of the films in the Star Wars Trilogy',
    values: {
      NEW_HOPE: { value: 4, description: 'Released in 1977.' },
      EMPIRE: { value: 5, description: 'Released in 1980.' },
      JEDI: { value: 6, description: 'Released in 1983.' },
    },
  });

  const characterInterface: GraphQLInterfaceType = new GraphQLInterfaceType({
    name: 'Character',
    description: 'A character in the Star Wars Trilogy',
    fields: () => buildCharacterFields(characterInterface, episodeEnum),
    resolveType() {
      return 'Human';
    },
  });

  const humanType = new GraphQLObjectType({
    name: 'Human',
    description: 'A humanoid creature in the Star Wars universe.',
    fields: () =>
      buildHumanFields(characterInterface, episodeEnum, () => []),
    interfaces: [characterInterface],
  });

  const droidType = new GraphQLObjectType({
    name: 'Droid',
    description: 'A mechanical creature in the Star Wars universe.',
    fields: () =>
      buildDroidFields(characterInterface, episodeEnum, () => []),
    interfaces: [characterInterface],
  });

  const queryType = new GraphQLObjectType({
    name: 'Query',
    fields: () =>
      buildQueryFields(
        characterInterface,
        humanType,
        droidType,
        episodeEnum,
        () => null,
        () => null,
        () => null,
      ),
  });

  describe('buildCharacterFields', () => {
    it('generates all character fields', () => {
      const fields = characterInterface.getFields();
      const fieldNames = Object.keys(fields);

      expect(fieldNames).to.include('id');
      expect(fieldNames).to.include('name');
      expect(fieldNames).to.include('friends');
      expect(fieldNames).to.include('appearsIn');
      expect(fieldNames).to.include('secretBackstory');
    });

    it('generates id field as NonNull String', () => {
      const fields = characterInterface.getFields();
      expect(fields.id.type).to.be.instanceOf(GraphQLNonNull);
      expect(fields.id.description).to.equal('The id of the character.');
    });

    it('generates friends field as List of Character', () => {
      const fields = characterInterface.getFields();
      expect(fields.friends.type).to.be.instanceOf(GraphQLList);
    });

    it('generates appearsIn field as List of Episode', () => {
      const fields = characterInterface.getFields();
      expect(fields.appearsIn.type).to.be.instanceOf(GraphQLList);
    });
  });

  describe('buildHumanFields', () => {
    it('generates human-specific fields', () => {
      const fields = humanType.getFields();
      const fieldNames = Object.keys(fields);

      expect(fieldNames).to.include('id');
      expect(fieldNames).to.include('name');
      expect(fieldNames).to.include('friends');
      expect(fieldNames).to.include('appearsIn');
      expect(fieldNames).to.include('homePlanet');
      expect(fieldNames).to.include('secretBackstory');
    });

    it('generates homePlanet as String', () => {
      const fields = humanType.getFields();
      expect(fields.homePlanet.type).to.equal(GraphQLString);
      expect(fields.homePlanet.description).to.equal(
        'The home planet of the human, or null if unknown.',
      );
    });
  });

  describe('buildDroidFields', () => {
    it('generates droid-specific fields', () => {
      const fields = droidType.getFields();
      const fieldNames = Object.keys(fields);

      expect(fieldNames).to.include('id');
      expect(fieldNames).to.include('name');
      expect(fieldNames).to.include('friends');
      expect(fieldNames).to.include('appearsIn');
      expect(fieldNames).to.include('secretBackstory');
      expect(fieldNames).to.include('primaryFunction');
    });

    it('generates primaryFunction as String', () => {
      const fields = droidType.getFields();
      expect(fields.primaryFunction.type).to.equal(GraphQLString);
      expect(fields.primaryFunction.description).to.equal(
        'The primary function of the droid.',
      );
    });
  });

  describe('buildQueryFields', () => {
    it('generates query fields', () => {
      const fields = queryType.getFields();
      const fieldNames = Object.keys(fields);

      expect(fieldNames).to.include('hero');
      expect(fieldNames).to.include('human');
      expect(fieldNames).to.include('droid');
    });

    it('generates hero field with episode argument', () => {
      const fields = queryType.getFields();
      expect(fields.hero.args).to.have.lengthOf(1);
      expect(fields.hero.args[0].name).to.equal('episode');
      expect(fields.hero.args[0].type).to.equal(episodeEnum);
    });

    it('generates human field with id argument', () => {
      const fields = queryType.getFields();
      expect(fields.human.args).to.have.lengthOf(1);
      expect(fields.human.args[0].name).to.equal('id');
      expect(fields.human.args[0].type).to.be.instanceOf(GraphQLNonNull);
      expect(fields.human.type).to.equal(humanType);
    });

    it('generates droid field with id argument', () => {
      const fields = queryType.getFields();
      expect(fields.droid.args).to.have.lengthOf(1);
      expect(fields.droid.args[0].name).to.equal('id');
      expect(fields.droid.args[0].type).to.be.instanceOf(GraphQLNonNull);
      expect(fields.droid.type).to.equal(droidType);
    });
  });

  describe('StarWarsSchema integration', () => {
    it('can be parsed by graphql core execution flow', () => {
      const source = `
        query HeroNameQuery {
          hero {
            name
          }
        }
      `;

      const result = graphqlSync({ schema: StarWarsSchema, source });
      expect(result.data).to.not.be.undefined;
      expect((result.data as any).hero.name).to.equal('R2-D2');
    });

    it('supports introspection queries', () => {
      const source = `
        {
          __schema {
            queryType {
              name
            }
          }
        }
      `;

      const result = graphqlSync({ schema: StarWarsSchema, source });
      expect((result.data as any).__schema.queryType.name).to.equal('Query');
    });

    it('supports nested queries with friends', () => {
      const source = `
        query HeroFriendsQuery {
          hero {
            id
            name
            friends {
              name
            }
          }
        }
      `;

      const result = graphqlSync({ schema: StarWarsSchema, source });
      expect(result.data).to.not.be.undefined;
      expect((result.data as any).hero.id).to.equal('2001');
      expect((result.data as any).hero.name).to.equal('R2-D2');
      expect((result.data as any).hero.friends).to.have.lengthOf(3);
    });

    it('supports querying human by id', () => {
      const source = `
        {
          human(id: "1000") {
            name
            homePlanet
          }
        }
      `;

      const result = graphqlSync({ schema: StarWarsSchema, source });
      expect(result.data).to.not.be.undefined;
      expect((result.data as any).human.name).to.equal('Luke Skywalker');
      expect((result.data as any).human.homePlanet).to.equal('Tatooine');
    });

    it('supports querying droid by id', () => {
      const source = `
        {
          droid(id: "2001") {
            name
            primaryFunction
          }
        }
      `;

      const result = graphqlSync({ schema: StarWarsSchema, source });
      expect(result.data).to.not.be.undefined;
      expect((result.data as any).droid.name).to.equal('R2-D2');
      expect((result.data as any).droid.primaryFunction).to.equal('Astromech');
    });
  });
});