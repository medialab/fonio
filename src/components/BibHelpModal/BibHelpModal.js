import React from 'react';
import PropTypes from 'prop-types';
import { translateNameSpacer } from '../../helpers/translateUtils';

import {
    ModalCard,
    Button,
    Content,
  } from 'quinoa-design-library/components/';
const BibHelpModal = ( {
    isOpen,
    onRequestClose,
    onChooseSample
}, context ) => {
    const translate = translateNameSpacer( context.t, 'Components.BibHelpModal' );

   const example = `@article{10.2307/1511524,
    ISSN = {07479360, 15314790},
    author = {Richard Buchanan},
    journal = {Design Issues},
    number = {1},
    pages = {4--22},
    publisher = {The MIT Press},
    title = {Declaration by Design: Rhetoric, Argument, and Demonstration in Design Practice},
    volume = {2},
    year = {1985}
}`;
   const onTest = () => {
     onChooseSample( example );
   };
    return (
      <ModalCard
        isActive={ isOpen }
        onClose={ onRequestClose }
        headerContent={ translate( 'Help with bibliographic citations' ) }
        style={ {
            maxHeight: '80%',
            minWidth: '80%'
        } }
        mainContent={
          <Content style={ { marginBottom: '2rem' } }>
            <p>
              {translate( 'In higher education and scientific research, a good practice for managing references and bibliographies is to use specialized software for storing and documenting references in a form which is independent of a specific citation style.' )}
            </p>
            <p>
              {translate( 'For a fast bibliography making tool, you can use zbib which helps building small bibliographies online:' )}
              <a
                target={ 'blank' }
                rel={ 'noopener' }
                href={ 'https://zbib.org/' }
              >
                zbib
              </a>
            </p>
            <p>
              {translate( 'For a more substantial bibliography making tool, you may want to install zotero software:' )}
              <a
                target={ 'blank' }
                rel={ 'noopener' }
                href={ 'https://zotero.org/' }
              >
                Zotero
              </a>
            </p>
            <p>
              {translate( 'Fonio accepts citation files in the form of bibtex files, which can be exported from all bibliography-related tools and websites.' )}
            </p>
            <p>
              {translate( 'Bibtex is a standard format for exchanging academic references accross tools. You should not have to manipulate them directly, but Bibtex data looks like this: ' )}
            </p>
            <div>
              <pre style={ { background: 'lightgrey' } }>{example}</pre>
            </div>
            <Button onClick={ onTest }>{translate( 'Try it !' )}</Button>
          </Content>
            }
      />
    );
};

BibHelpModal.contextTypes = {
    t: PropTypes.func,
};

export default BibHelpModal;
