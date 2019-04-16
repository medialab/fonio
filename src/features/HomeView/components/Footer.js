/**
 * This module provides the footer of the home view
 * @module fonio/features/HomeView
 */
/* eslint react/no-danger : 0 */
/**
 * Imports Libraries
 */
import React from 'react';
import {
  Footer,
  Container,
  Columns,
  Column,
  Content,
} from 'quinoa-design-library/components/';

import medialabLogo from '../assets/logo-medialab.svg';
import forccastLogo from '../assets/logo-forccast.svg';

const logoStyle = {
  maxWidth: '150px',
  paddingBottom: '.5rem',
  paddingTop: '.5rem',
  boxSizing: 'content-box',
  paddingLeft: '2rem',
  display: 'block'
};

const FooterComponent = ( {
  id,
  translate
} ) => (
  <Footer id={ id }>
    <Container>
      <Columns>
        <Column isSize={ '1/3' }>
          <div>
            <a
              target={ 'blank' }
              href={ 'http://controverses.org/' }
            >
              <img
                style={ logoStyle }
                src={ forccastLogo }
              />
            </a>
            <a
              target={ 'blank' }
              href={ 'https://medialab.sciencespo.fr' }
            >
              <img
                style={ logoStyle }
                src={ medialabLogo }
              />
            </a>
          </div>
        </Column>
        <Column isSize={ '2/3' }>
          <Content
            style={ { paddingLeft: '1rem' } }
            isSize={ 'small' }
          >
            <p
              dangerouslySetInnerHTML={ {
                        __html: translate( 'Made at the <a target="blank" href="http://medialab.sciencespo.fr/">médialab SciencesPo</a>, a research laboratory that connects social sciences with inventive methods.' )
                      } }
            />
            <p
              dangerouslySetInnerHTML={ {
                        __html: translate( 'Provided by the <a target="blank" href="http://controverses.org/">FORCCAST</a> program, fostering pedagogical innovations in controversy mapping.' )
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
        </Column>
      </Columns>

    </Container>
  </Footer>
);

export default FooterComponent;
