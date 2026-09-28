"""Runs tests/test_pipeline.py where pytest cannot be installed (shim for pytest.raises only)."""
import sys, types, traceback
from pathlib import Path
from contextlib import contextmanager
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

@contextmanager
def raises(exc):
    try:
        yield
    except exc:
        return
    raise AssertionError(f"expected {exc.__name__}")

try:
    import pytest  # noqa
except ImportError:
    stub = types.ModuleType("pytest"); stub.raises = raises; sys.modules["pytest"] = stub
import tests.test_pipeline as t

def main():
    fns = [(n, f) for n, f in vars(t).items() if n.startswith("test_") and callable(f)]
    bad = 0
    for n, f in fns:
        try:
            f(); print("PASS", n)
        except Exception as e:
            bad += 1; print("FAIL", n, "->", repr(e)); traceback.print_exc(limit=3)
    print(f"\n{len(fns)-bad} passed, {bad} failed, {len(fns)} total"); sys.exit(1 if bad else 0)

main()
