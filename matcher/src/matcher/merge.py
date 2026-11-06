def row_merge(target_row, supplemental_row, common, target_strip=frozenset(), supp_strip=frozenset()):
    """
    Appends non-shared supplemental columns to a target row, dropping any
    column in `target_strip` / `supp_strip` — the geographic identifiers
    identifiers.identify_columns found in that file (see pipeline.coordinator
    / web_api._prepare), shared with the other file or not. There is no
    override: an identifier column never reaches the linked output.
    """
    shared_s_indices = {col["header2Index"] for col in common}
    target_part = [v for i, v in enumerate(target_row) if i not in target_strip]
    extras = [
        v for i, v in enumerate(supplemental_row)
        if i not in shared_s_indices and i not in supp_strip
    ]
    return target_part + extras


def new_header(target_headers, supplemental_headers, common, target_strip=frozenset(), supp_strip=frozenset()):
    """Builds the merged header list — see row_merge for `*_strip`."""
    shared_s_indices = {col["header2Index"] for col in common}
    target_part = [h for i, h in enumerate(target_headers) if i not in target_strip]
    extra_headers = [
        h for i, h in enumerate(supplemental_headers)
        if i not in shared_s_indices and i not in supp_strip
    ]
    return target_part + extra_headers
