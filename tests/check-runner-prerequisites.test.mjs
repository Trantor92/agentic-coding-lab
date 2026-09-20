import assert from "node:assert/strict";
import { checkNodeVersion, checkGit } from "../scripts/check-runner-prerequisites.mjs";

console.log("🧪 Testing Runner Prerequisites checks...");

// 1. Node version check
const validNode = checkNodeVersion("v20.11.0");
assert.equal(validNode.passed, true, "Node >= 20 must pass");

const oldNode = checkNodeVersion("v18.19.0");
assert.equal(oldNode.passed, false, "Node < 20 must fail");

// 2. Git check
const gitRes = checkGit();
assert.equal(typeof gitRes.passed, "boolean");

console.log("✅ Runner Prerequisites tests passed successfully.");
