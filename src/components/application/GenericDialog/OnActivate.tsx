import React from 'react';

// Triggers the onActivate function when index transitions to activateIndex
const OnActivate = ({ index, activeIndex, onActivate, children, values, setValues }) => {
  const [activated, setActivated] = React.useState(false);
  React.useEffect(() => {
    if (index === activeIndex) {
      if (activated === false) {
        setActivated(true); // Flag activation has occurred
        onActivate && onActivate({ values, setValues }); // Execute activation
      }
    } else {
      activated === true && setActivated(false); // Reset activation flag
    }
  }, [index, activeIndex, activated, setActivated, onActivate, values, setValues]);
  return activated && children;
};

export default OnActivate;
