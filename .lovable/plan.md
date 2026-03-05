

## Problem

`scikit-surprise` fails to compile on Render because it's using Python 3.14, which is too new for the package's Cython code.

## Fix

Two changes needed in the `backend/` directory:

1. **Pin Python version** in `backend/runtime.txt` to a compatible version:
   ```
   python-3.11.11
   ```

2. **Pin `scikit-surprise` version** in `backend/requirements.txt` to ensure compatibility:
   ```
   pandas
   numpy
   scikit-learn
   nltk
   scikit-surprise==1.1.4
   pickle-mixin
   ```

   Also add `fastapi` and `uvicorn` which are needed to run your API but are missing from requirements.

   Updated `requirements.txt`:
   ```
   pandas
   numpy
   scikit-learn
   nltk
   scikit-surprise==1.1.4
   pickle-mixin
   fastapi
   uvicorn
   ```

3. **Verify Render settings** — make sure the **Python version** setting in Render dashboard uses `runtime.txt` (it should pick it up automatically).

After making these changes, trigger a new deploy on Render. The build should succeed with Python 3.11.

