// MIT: https://github.com/solidjs/solid/blob/main/packages/solid-element/src/index.ts

import {
  register,
  type ComponentType as mComponentType,
  type ICustomElement,
  type ComponentOptions,
  type PropsDefinitionInput,
} from "npm:component-register@~0.8.6";
export {
  hot,
  getCurrentElement,
  noShadowDOM,
} from "npm:component-register@~0.8.6";
export type ComponentType<T> = mComponentType<T>;
import { createRoot, createSignal, type JSX } from "npm:solid-js@~1.8.22";
import { render } from "npm:solid-js@~1.8.22/web";

function createProps<T extends object>(raw: T) {
  const keys = Object.keys(raw) as (keyof T)[];
  const props = {};
  for (let i = 0; i < keys.length; i++) {
    const [get, set] = createSignal(raw[keys[i]]);
    Object.defineProperty(props, keys[i], {
      get,
      set(v) {
        set(() => v);
      },
    });
  }
  return props as T;
}

function lookupContext(el: ICustomElement & { _$owner?: any }) {
  if (el.assignedSlot && el.assignedSlot._$owner)
    return el.assignedSlot._$owner;
  let next: Element & { _$owner?: any } = el.parentNode;
  while (
    next &&
    !next._$owner &&
    !(
      next.assignedSlot &&
      (next.assignedSlot as Element & { _$owner?: any })._$owner
    )
  )
    next = next.parentNode as Element;
  return next && next.assignedSlot
    ? (next.assignedSlot as Element & { _$owner?: any })._$owner
    : el._$owner;
}

type WCComponentOptions<T> = {
  props: T;
  element: ICustomElement & { _$owner?: unknown } & HTMLElement;
  setRenderRoot: (root: ICustomElement["renderRoot"] | null) => void;
};

type WcComponentType<T> = (
  options: WCComponentOptions<T>
) => null | ((props: T) => JSX.Element);

function withSolidWc<T extends object>(
  ComponentType: WcComponentType<T>
): ComponentType<T> {
  return (rawProps: T, options: ComponentOptions) => {
    const { element } = options as WCComponentOptions<T>;
    return createRoot((dispose) => {
      let renderRoot: ICustomElement["renderRoot"] | null = element;
      const props = createProps<T>(rawProps);
      Object.defineProperty(element, "renderRoot", {
        get() {
          return renderRoot;
        },
      });
      element.addPropertyChangedCallback(
        (key: string, val: any) => (props[key as keyof T] = val)
      );
      element.addReleaseCallback(() => {
        if (renderRoot) renderRoot.textContent = "";
        dispose();
      });
      const compFn = (ComponentType as WcComponentType<T>)({
        props,
        element,
        setRenderRoot: (value) => {
          renderRoot = value;
        },
      });
      if (renderRoot && compFn) return render(() => compFn(props), renderRoot);
    }, lookupContext(element));
  };
}

function defineElement<T extends object>(
  tag: string,
  props: PropsDefinitionInput<T>,
  ComponentType: WcComponentType<T>
): { elementConstructor: CustomElementConstructor; propTypes: T } {
  const elementConstructor = register<T>(
    tag,
    props as PropsDefinitionInput<T>
  )(withSolidWc(ComponentType));
  return { elementConstructor, propTypes: null as unknown as T };
}

export { withSolidWc, defineElement };
