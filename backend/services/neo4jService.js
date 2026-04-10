import { getSession } from '../config/neo4j.js';

export const createPatientNode = async (patientId, name) => {
  const session = getSession();
  try {
    await session.run(
      'MERGE (p:Patient {id: $id}) SET p.name = $name RETURN p',
      { id: patientId.toString(), name }
    );
  } catch (error) {
    console.error('Neo4j Create Patient Error:', error);
  } finally {
    await session.close();
  }
};

export const recordAnomaly = async (patientId, severityScore, conditionType) => {
  const session = getSession();
  try {
    await session.run(`
      MATCH (p:Patient {id: $patientId})
      MERGE (a:Anomaly {type: $conditionType})
      MERGE (p)-[r:EXPERIENCED {severity: $severityScore, date: datetime()}]->(a)
      RETURN p, a, r
    `, { patientId: patientId.toString(), conditionType: conditionType || 'General Anomaly', severityScore });
  } catch (error) {
    console.error('Neo4j Record Anomaly Error:', error);
  } finally {
    await session.close();
  }
};

export const findSimilarCases = async (patientId) => {
  const session = getSession();
  try {
    const result = await session.run(`
      MATCH (p1:Patient {id: $patientId})-[:EXPERIENCED]->(a:Anomaly)<-[:EXPERIENCED]-(p2:Patient)
      RETURN DISTINCT p2.id AS similarPatientId, p2.name AS name, a.type AS condition
    `, { patientId: patientId.toString() });

    return result.records.map(record => ({
      patientId: record.get('similarPatientId'),
      name: record.get('name'),
      condition: record.get('condition')
    }));
  } catch (error) {
    console.error('Neo4j Find Similar Cases Error:', error);
    return [];
  } finally {
    await session.close();
  }
};
