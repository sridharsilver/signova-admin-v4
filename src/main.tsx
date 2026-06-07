import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { ErrorBoundary } from "./components/ErrorBoundary";
import "./index.css";

// Patch DOM to prevent React crashes from browser extensions (e.g. Google Translate) modifying DOM nodes
if (typeof Node === "function" && Node.prototype) {
  const originalRemoveChild = Node.prototype.removeChild;
  Node.prototype.removeChild = function (this: Node, ...args: [child: Node]) {
    const child = args[0];
    if (child.parentNode !== this) {
      console.warn("Prevented React crash: Cannot remove a child from a different parent", child, this);
      return child;
    }
    return originalRemoveChild.apply(this, args);
  };

  const originalInsertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function (this: Node, ...args: [newNode: Node, referenceNode: Node | null]) {
    const referenceNode = args[1];
    if (referenceNode && referenceNode.parentNode !== this) {
      console.warn("Prevented React crash: Cannot insert before a reference node from a different parent", referenceNode, this);
      return args[0];
    }
    return originalInsertBefore.apply(this, args);
  };
}

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
