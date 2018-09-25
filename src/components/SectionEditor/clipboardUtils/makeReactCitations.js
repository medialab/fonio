
import { Parser } from 'html-to-react';

const htmlToReactParser = new Parser();

const makeReactCitations = ( processor, cits ) => {
  return cits.reduce( ( inputCitations, citationData ) => {
    const citations = { ...inputCitations };
    const citation = citationData[0];
    const citationsPre = citationData[1];
    const citationsPost = citationData[2];
    let citationObjects = processor.processCitationCluster( citation, citationsPre, citationsPost );
    citationObjects = citationObjects[1];
    citationObjects.forEach( ( cit ) => {
      const order = cit[0];
      const html = cit[1];
      const ThatComponent = htmlToReactParser.parse( cit[1] );
      const citationId = cit[2];
      citations[citationId] = {
        order,
        html,
        Component: ThatComponent
      };
    } );
    return citations;
  }, {} );
};

export default makeReactCitations;
