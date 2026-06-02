#!/usr/bin/env python3
from pathlib import Path
import shutil
import os

SRC = Path("assets/02-portraits")
OUT = Path("assets/portraits-by-jersey")

GROUPS = {
    "0-davys-KABRERA": {
        "DSC00038.jpg", "DSC00059.jpg", "DSC00158.jpg", "DSC00333.jpg", "DSC00338.jpg",
        "DSC00419.jpg", "DSC00488.jpg", "DSC00489-2.jpg", "DSC00500.jpg",
        "DSC00502.jpg", "DSC00509.jpg", "DSC00523.jpg", "DSC00690.jpg",
    },
    "9-johan-LOVE-YOURZ": {
        "DSC00055.jpg", "DSC00250.jpg", "DSC00251.jpg", "DSC00645.jpg", "DSC00652.jpg",
        "DSC00712.jpg",
    },
    "12-Jonathan": {
        "DSC00231.jpg", "DSC00244.jpg", "DSC00245.jpg", "DSC00273.jpg", "DSC00275.jpg",
        "DSC00279.jpg", "DSC00280.jpg", "DSC00286.jpg", "DSC00293.jpg", "DSC00320.jpg",
    },
    "24-Lucas": {
        "DSC00092.jpg", "DSC00122.jpg", "DSC00416.jpg", "DSC00512.jpg", "DSC00682-2.jpg",
        "DSC00682.jpg",
    },
    "25-Vincent-VINCENTE": {
        "DSC00102.jpg", "DSC00103.jpg", "DSC00331.jpg", "DSC00375.jpg", "DSC00409.jpg",
        "DSC00559.jpg", "DSC00637.jpg",
    },
    "33-JD-PRESIDENT": {
        "DSC00014.jpg", "DSC00261.jpg", "DSC00263.jpg", "DSC00267.jpg", "DSC00272.jpg",
        "DSC00464.jpg",
    },
    "55-christina": {
        "DSC00049.jpg", "DSC00137.jpg", "DSC00142.jpg", "DSC00145.jpg", "DSC00150.jpg",
        "DSC00153.jpg", "DSC00630.jpg", "DSC00714.jpg",
    },
    "67-Kenael-OBITO": {
        "DSC00016.jpg", "DSC00022.jpg", "DSC00034.jpg", "DSC00095.jpg", "DSC00108.jpg",
        "DSC00111.jpg", "DSC00551.jpg", "DSC00699.jpg",
    },
    "84-Bolo": {
        "DSC00123.jpg", "DSC00124.jpg", "DSC00127.jpg", "DSC00132.jpg", "DSC00152.jpg",
        "DSC00493.jpg",
    },
    "90-Sasha-PIKACHU": {
        "DSC00027.jpg", "DSC00061.jpg", "DSC00200.jpg", "DSC00695.jpg",
    },
    "99-Ulric": {
        "DSC00204.jpg", "DSC00432.jpg", "DSC00447.jpg", "DSC00448.jpg",
    },
}


def main():
    if OUT.exists():
        for root, dirs, files in os.walk(OUT, topdown=False):
            for name in files:
                try:
                    (Path(root) / name).unlink()
                except FileNotFoundError:
                    pass
            for name in dirs:
                try:
                    (Path(root) / name).rmdir()
                except FileNotFoundError:
                    pass
                except OSError:
                    shutil.rmtree(Path(root) / name, ignore_errors=True)
        try:
            OUT.rmdir()
        except FileNotFoundError:
            pass
        except OSError:
            shutil.rmtree(OUT, ignore_errors=True)
    OUT.mkdir()

    assigned = {}
    for group, names in GROUPS.items():
        folder = OUT / group
        folder.mkdir()
        for name in sorted(names):
            assigned[name] = folder

    review = OUT / "review-no-number"
    review.mkdir()

    for p in sorted(SRC.iterdir()):
        if not p.is_file():
            continue
        dest = assigned.get(p.name, review)
        shutil.copy2(p, dest / p.name)

    for folder in sorted(OUT.iterdir()):
        if folder.is_dir():
            print(f"{folder.name}: {sum(1 for _ in folder.iterdir())}")


if __name__ == "__main__":
    main()
