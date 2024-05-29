import { REACT_ELEMENT } from "./utils";
import { Component } from "./Component";

function createElement(type, properties, children) {
  const key = properties.key || null;
  const ref = properties.ref || null;

  ["key", "ref", "__self", "__source"].forEach((k) => {
    delete properties[k];
  });

  const props = { ...properties };

  const childrenLength = arguments.length - 2;

  if (childrenLength === 1) {
    props.children = children;
  } else if (childrenLength > 1) {
    props.children = Array.prototype.slice.call(arguments, 2);
  }

  return { type, $$typeof: REACT_ELEMENT, key, ref, props };
}

function createRef() {
  return {
    current: null,
  };
}

const React = { createElement, Component, createRef };

export default React;
