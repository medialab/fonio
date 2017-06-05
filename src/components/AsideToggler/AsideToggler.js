import React from 'react';

import './AsideToggler.scss';

const AsideToggler = ({
  options = [],
  setOption,
  activeOption,
  hideNav,
}) => {
  let aIndex;
  options.some((option, index) => {
    if (option.id === activeOption) {
      aIndex = index;
      return true;
    }
  });

  const onPrev = () => {
    if (activeOption) {
      if (aIndex > 0) {
        setOption(options[aIndex - 1].id);
      }
 else {
        setOption(options[aIndex.length - 1].id);
      }
    }
 else if (options.length) {
      setOption(options[0].id);
    }
  };
  const onNext = () => {
    if (activeOption) {
      if (aIndex < options.length - 1) {
        setOption(options[aIndex + 1].id);
      }
 else {
        setOption(options[0].id);
      }
    }
 else if (options.length) {
      setOption(options[0].id);
    }
  };
  return (
    <ul className="fonio-aside-toggler">
      {aIndex > 0 && !hideNav && <li onClick={onPrev} className="nav-btn">◄</li>}
      <li className="options-wrapper">
        <ul
          className="options-container">
          {
        options.map((option, index) => {
          return (
            <li
              className="option"
              key={index}
              style={{
                left: (index - aIndex) * 100 + '%'
              }}>
              <h2>{option.name}</h2>
            </li>
          );
        })
      }
        </ul>
      </li>
      {aIndex < options.length - 1 && !hideNav && <li onClick={onNext} className="nav-btn">►</li>}
    </ul>
  );
};

export default AsideToggler;
