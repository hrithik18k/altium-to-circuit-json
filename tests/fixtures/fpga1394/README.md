# FPGA1394 S02 regression evidence

- `u1d-altium-reference.png`: actual Altium screenshot supplied with the issue, showing U1D and its connections. This is not an altiumts rendering: altiumts 0.0.26 also ignores the selected display mode.
- `s02-before.circuit.json`: unmodified failing Circuit JSON supplied with the issue. Used only as frozen before-fix evidence; the after-fix panel is regenerated from the checksum-pinned public SchDoc on every test run.
- Source: https://github.com/jhu-cisst/FPGA1394/blob/b0a9dbfd8af3fb902fd05d26375927e0d125713d/S02.SchDoc (byte-identical to the supplied SchDoc).

The snapshot labels reference, before, and after explicitly. Cropping only affects the viewport, not source records, pin positions, labels, or connections. The actual converter remains component-independent.
