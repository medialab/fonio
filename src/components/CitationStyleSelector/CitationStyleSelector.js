import React from 'react';

import {
    Box,
    Label,
    StretchedLayoutContainer,
    StretchedLayoutItem,
    Button,
  } from 'quinoa-design-library/components/';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretLeft } from '@fortawesome/free-solid-svg-icons/faCaretLeft';
import { faCaretRight } from '@fortawesome/free-solid-svg-icons/faCaretRight';

import BibliographicPreview from '../BibliographicPreview';

import apa from 'raw-loader!../../sharedAssets/bibAssets/apa.csl';
import chicagoFr from 'raw-loader!../../sharedAssets/bibAssets/chicago-author-date-fr.csl';
import chicagoEn from 'raw-loader!../../sharedAssets/bibAssets/chicago-author-date.csl';
import isoFr from 'raw-loader!../../sharedAssets/bibAssets/iso690-author-date-fr.csl';
import isoEn from 'raw-loader!../../sharedAssets/bibAssets/iso690-author-date-en.csl';

import './CitationStyleSelector.scss';

  const styles = [
      {
          data: apa,
          fileName: 'apa.csl',
          id: 'apa-5th-edition',
          title: 'American Psychological Association 5th edition'
      },
      {
        data: chicagoFr,
        fileName: 'chicago-author-date-fr.csl',
        id: 'chicago-author-date-fr',
        title: 'Chicago Manual of Style 16th edition (fr)'
      },
      {
        data: chicagoEn,
        fileName: 'chicago-author-date-en.csl',
        id: 'chicago-author-date-en',
        title: 'Chicago Manual of Style 16th edition (en)'
      },
      {
        data: isoFr,
        fileName: 'iso690-author-date-fr.csl',
        id: 'iso690-author-date-fr',
        title: 'ISO-690 (fr)'
      },
      {
        data: isoEn,
        fileName: 'iso690-author-date-en.csl',
        id: 'iso690-author-date-en',
        title: 'ISO-690 (en)'
      },
  ];

const sample = {
    buchanan1985declaration: {
      'container-title': 'Design issues',
      'publisher': 'JSTOR',
      'title': 'Declaration by design: Rhetoric, argument, and demonstration in design practice',
      'author': [
        {
          given: 'Richard',
          family: 'Buchanan'
        }
      ],
      'page': '4-22',
      'type': 'article-journal',
      'citation-label': 'buchanan1985declaration',
      'id': 'buchanan1985declaration',
      'year-suffix': 'declaration',
      'issued': {
        'date-parts': [
            [
                '1985'
            ]
        ]
    },
    }
  };

const CitationStyleSelector = ( {
    story,
    onChange
} ) => {
    const citationStyleId = story.settings.citationStyle.id;
    let currentIndex = 0;
    styles.some( ( style, index ) => {
        if ( style.id === citationStyleId ) {
            currentIndex = index;
            return true;
        }
    } );
    const currentItem = styles[currentIndex];

    const onPrev = () => {
        if ( currentIndex === 0 ) {
            onChange( styles[styles.length - 1] );
        }
        else {
            onChange( styles[currentIndex - 1] );
        }
    };

    const onNext = () => {
        if ( currentIndex === styles.length - 1 ) {
            onChange( styles[0] );
        }
        else {
            onChange( styles[currentIndex + 1] );
        }
    };

    return (
      <Box className={ 'citation-style-selector' }>
        <StretchedLayoutContainer
          style={ { alignItems: 'center' } }
          isDirection={ 'horizontal' }
        >
          <StretchedLayoutItem>
            <Button
              onClick={ onPrev }
              isRounded
            >
              <FontAwesomeIcon icon={ faCaretLeft } />
            </Button>
          </StretchedLayoutItem>
          <StretchedLayoutItem isFlex={ 1 }>
            <Label>{currentItem.title}</Label>
            <BibliographicPreview
              items={ sample }
              style={ currentItem.data }
            />
          </StretchedLayoutItem>
          <StretchedLayoutItem>
            <Button
              onClick={ onNext }
              isRounded
            >
              <FontAwesomeIcon icon={ faCaretRight } />
            </Button>
          </StretchedLayoutItem>
        </StretchedLayoutContainer>

      </Box>
    );
};

export default CitationStyleSelector;
