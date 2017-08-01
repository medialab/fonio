/**
 * This module provides a aside toggler element component
 * Sets the mode of an aside ui column
 * @module fonio/components/AsideToggler
 */
import React from 'react';
import PropTypes from 'prop-types';

import './AsideToggler.scss';


/**
 * Renders the AsideToggler component as a pure function
 * @param {object} props - used props (see prop types below)
 * @return {ReactElement} component - the resulting component
 */
const AsideToggler = ({
  options = [],
  setOption,
  activeOption,
  // hideNav,
}) => {
  // let aIndex;
  // options.some((option, index) => {
  //   if (option.id === activeOption) {
  //     aIndex = index;
  //     return true;
  //   }
  // });

  // const onPrev = () => {
  //   if (activeOption) {
  //     if (aIndex > 0) {
  //       setOption(options[aIndex - 1].id);
  //     }
  //     else {
  //       setOption(options[aIndex.length - 1].id);
  //     }
  //   }
  //   else if (options.length) {
  //     setOption(options[0].id);
  //   }
  // };
  // const onNext = () => {
  //   if (activeOption) {
  //     if (aIndex < options.length - 1) {
  //       setOption(options[aIndex + 1].id);
  //     }
  //     else {
  //       setOption(options[0].id);
  //     }
  //   }
  //   else if (options.length) {
  //     setOption(options[0].id);
  //   }
  // };
  return (
    <ul className="fonio-AsideToggler">
      {
        options.map((option, index) => {
          const onClick = () => {
            setOption(option.id);
          };
          return (
            <li
              className={'option' + (activeOption === option.id ? ' active' : '')}
              onClick={onClick}
              key={index}>
              <span>{option.name}</span>
            </li>
          );
        })
      }
    </ul>
  );
  // old ui with arrows
  // depracated but left here in case we change our minds
  // return (
  //   <ul className="fonio-AsideToggler">
  //     {aIndex > 0 && !hideNav && <li onClick={onPrev} className="nav-btn">◄</li>}
  //     <li className="options-wrapper">
  //       <ul
  //         className="options-container">
  //         {
  //       options.map((option, index) => {
  //         return (
  //           <li
  //             className="option"
  //             key={index}
  //             style={{
  //               left: (index - aIndex) * 100 + '%'
  //             }}>
  //             <h2>{option.name}</h2>
  //           </li>
  //         );
  //       })
  //     }
  //       </ul>
  //     </li>
  //     {aIndex < options.length - 1 && !hideNav && <li onClick={onNext} className="nav-btn">►</li>}
  //   </ul>
  // );
};

/**
 * Component's properties types
 */
AsideToggler.propTypes = {

  /**
   * Side column available options
   */
  options: PropTypes.array,

  /**
   * Id of the active option
   */
  activeOption: PropTypes.string,

  /**
   * Whether nav buttons are hidden
   */
  hideNav: PropTypes.bool,

  /**
   * Callbacks an option choice
   */
  setOption: PropTypes.func,
};

export default AsideToggler;
