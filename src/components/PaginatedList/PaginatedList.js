/* eslint  react/no-set-state : 0 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Tooltip from 'react-tooltip';

import Masonry from 'react-masonry-css';

import { translateNameSpacer } from '../../helpers/translateUtils';

import './PaginatedList.scss';

const DEFAULT_ITEMS_PER_PAGE_NUMBER = 10;

export default class PaginatedList extends Component {
  static contextTypes = {
    t: PropTypes.func,
  }

  constructor( props ) {
    super( props );

    this.state = {
      displayedPaginationItems: undefined,
      paginationPosition: 0,
    };
  }

  componentDidMount = () => {
    this.updatePaginationItems( this.props );
    setTimeout( () => {
      Tooltip.rebuild();
    } );
  }

  componentWillReceiveProps = ( nextProps ) => {
    if ( this.props.items.length !== nextProps.length ) {
      this.updatePaginationItems( nextProps );
    }
    Tooltip.rebuild();
  }

  updatePaginationItems = ( {
    items,
    itemsPerPage = DEFAULT_ITEMS_PER_PAGE_NUMBER,
  } ) => {
    const {
      paginationPosition: inputPaginationPosition,
    } = this.state;
    const numberOfPages = Math.ceil( items.length / itemsPerPage );
    let paginationPosition = inputPaginationPosition < numberOfPages ? inputPaginationPosition : numberOfPages - 1;
    paginationPosition = paginationPosition > 0 ? paginationPosition : 0;
    const paginationItems = [];
    for ( let iter = 0; iter < numberOfPages; iter++ ) {
      paginationItems.push( {
        index: iter,
        content: iter + 1,
        active: paginationPosition === iter ? true : false
      } );
    }

    let displayedPaginationItems = paginationItems;
    if ( paginationItems.length > 5 ) {
      displayedPaginationItems = [
        paginationPosition > 0 ? paginationItems[0] : undefined,
        paginationPosition > 2 ? {
          index: paginationPosition - 2,
          content: <span className={ 'pagination-ellipsis' }>&hellip;</span>
        } : undefined,
        paginationPosition > 1 ? paginationItems[paginationPosition - 1] : undefined,
        paginationItems[paginationPosition],
        paginationPosition + 1 < paginationItems.length - 2 ?
          paginationItems[paginationPosition + 1] : undefined,
        paginationPosition < paginationItems.length - 4 ? {
          index: paginationPosition + 4,
          content: <span className={ 'pagination-ellipsis' }>&hellip;</span>
        } : undefined,
        // paginationPosition + 1 < paginationItems.length - 1 ? paginationItems[paginationItems.length + 1] : undefined,
        paginationPosition < paginationItems.length - 2 ?
          paginationItems[paginationItems.length - 2]
          : undefined,
        paginationPosition < paginationItems.length - 1 ?
          paginationItems[paginationItems.length - 1]
          : undefined
      ]
      .filter( ( item ) => item );
    }
    let displayFrom = paginationPosition * itemsPerPage;
    displayFrom = displayFrom === 0 ? displayFrom : displayFrom - 1;
    let displayTo = paginationPosition * itemsPerPage + itemsPerPage;
    displayTo = displayTo < items.length ? displayTo : ( items.length || 1 );
    const displayedItems = items.slice(
      displayFrom,
      displayTo,
    );

    this.setState( {
      displayedPaginationItems,
      numberOfPages,
      displayedItems,
      paginationPosition,
    } );
  }

  setPaginationPosition = ( paginationPosition ) => {
    this.setState( { paginationPosition } );
    setTimeout( () => {
      this.updatePaginationItems( this.props );
      if ( this.scrollContainer ) {
        this.scrollContainer.scrollTop = 0;
      }
    } );

  }

  onPaginationClick = ( item ) => {
      this.setPaginationPosition( item.index );
    };
  onPaginationPrev = () => {
    const { paginationPosition } = this.state;
    if ( paginationPosition > 0 ) {
      this.setPaginationPosition( paginationPosition - 1 );
    }
  };
  onPaginationNext = () => {
    const { paginationPosition, numberOfPages } = this.state;
    if ( paginationPosition < numberOfPages - 1 ) {
      this.setPaginationPosition( paginationPosition + 1 );
    }
  };

  render = () => {
    const {
      props: {
        renderItem,
        minified,
        renderNoItem = () => <div>No items to display</div>,
        className = '',
        itemsContainerClassName = '',
        style,
        id,
      },
      state: {
        displayedItems = [],
        displayedPaginationItems,
        paginationPosition,
        numberOfPages,
      },
      context: { t },
      onPaginationClick,
      onPaginationPrev,
      onPaginationNext,
    } = this;

    const translate = translateNameSpacer( t, 'Components.PaginatedList' );

    const bindScrollContainer = ( scrollContainer ) => {
      this.scrollContainer = scrollContainer;
    };

    return (
      <div
        style={ style }
        id={ id }
        className={ `fonio-PaginatedList ${className}` }
      >
        <div
          ref={ bindScrollContainer }
          className={ `items-container is-flex-1 is-scrollable ${itemsContainerClassName}` }
        >
          <Masonry
            breakpointCols={ {
              default: 3,
              1024: 2,
              // 768: 2,
              500: 1
            } }
            className={ 'my-masonry-grid' }
            columnClassName={ 'my-masonry-grid_column' }
          >
            {
            displayedItems.length ?
              displayedItems.map( renderItem )
            : renderNoItem()
            }
          </Masonry>
          <Tooltip id={ 'tooltip' } />
        </div>
        {displayedPaginationItems &&
          displayedPaginationItems.length > 1 ?
            <nav
              className={ 'pagination is-rounded is-centered' }
              role={ 'navigation' }
              aria-label={ 'pagination' }
            >
              <a
                onClick={ onPaginationPrev }
                className={ `pagination-previous ${paginationPosition === 0 ? 'is-disabled' : ''}` }
              >
                {minified ? <i className={ 'fas fa-chevron-left' } /> : translate( 'previous' )}
              </a>
              <a
                onClick={ onPaginationNext }
                className={ `pagination-next ${paginationPosition === numberOfPages - 1 ? 'is-disabled' : ''}` }
              >
                {minified ? <i className={ 'fas fa-chevron-right' } /> : translate( 'next' )}
              </a>
              <ul className={ 'pagination-list' }>
                {
                displayedPaginationItems.map( ( item, index ) => {
                  const handleClick = () => {
                    onPaginationClick( item );
                  };
                  return (
                    <li
                      className={ item.active ? 'is-current' : '' }
                      key={ index }
                      onClick={ handleClick }
                    >
                      <a className={ 'pagination-link' }>{item.content}</a>
                    </li>
                  );
                } )
              }
              </ul>
            </nav>
          : null}
      </div>
    );
  }
}
