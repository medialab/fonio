/* eslint react/no-danger : 0 */

import React from 'react';

import {
  Footer,
  Container,
  Content,
} from 'quinoa-design-library/components/';

const FooterComponent = ( {
  id,
  translate
} ) => (
  <Footer id={ id }>
    <Container>
      <Content isSize={ 'small' }>
        <p
          dangerouslySetInnerHTML={ {
                    __html: translate( 'Provided by the <a target="blank" href="http://controverses.org/">FORCCAST</a> program, fostering pedagogical innovations in controversy mapping.' )
                  } }
        />
        <p
          dangerouslySetInnerHTML={ {
                    __html: translate( 'Made at the <a target="blank" href="http://medialab.sciencespo.fr/">médialab SciencesPo</a>, a research laboratory that connects social sciences with inventive methods.' )
                  } }
        />
        <p>
          {translate( 'Avatar icons courtesy of ' )}
          <a
            target={ 'blank' }
            href={ 'https://www.flaticon.com/packs/people-faces' }
          >
                  Freepik
          </a>.
        </p>
        <p>
          <span
            dangerouslySetInnerHTML={ {
                __html: translate( 'The source code of Fonio is licensed under free software license ' )
              } }
          />
          <a
            target={ 'blank' }
            href={ 'http://www.gnu.org/licenses/agpl-3.0.html' }
          >
                  AGPL v3
          </a>
          {translate( ' and is hosted on ' )}
          <a
            target={ 'blank' }
            href={ 'https://github.com/medialab/fonio/' }
          >
                  Github
          </a>.
        </p>
      </Content>
    </Container>
  </Footer>
);

export default FooterComponent;
