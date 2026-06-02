#!/usr/bin/env python3
from pathlib import Path
import shutil

BASE = Path("assets")

DETAILS = {
    "DSC00001.jpg", "DSC00003.jpg", "DSC00004.jpg", "DSC00009.jpg", "DSC00012.jpg",
    "DSC00028.jpg", "DSC00057.jpg", "DSC00069.jpg", "DSC00683.jpg", "DSC00684.jpg",
    "DSC00691.jpg", "DSC00370.jpg", "DSC00513.jpg", "DSC00570.jpg", "DSC00570-2.jpg",
    "DSC00570-3.jpg", "DSC00945.jpg", "DSC01117.jpg", "DSC01212.jpg", "DSC01216.jpg",
}

GROUP = {
    "DSC00318.jpg", "DSC00349.jpg", "DSC00686.jpg", "DSC00935.jpg", "DSC00943.jpg",
    "DSC00961.jpg", "DSC00962.jpg", "DSC00966.jpg", "DSC00975.jpg", "DSC01141.jpg",
    "DSC01153.jpg", "DSC01169.jpg", "DSC01263.jpg",
}

PORTRAITS = {
    "DSC00014.jpg", "DSC00016.jpg", "DSC00022.jpg", "DSC00027.jpg", "DSC00034.jpg",
    "DSC00038.jpg", "DSC00049.jpg", "DSC00055.jpg", "DSC00059.jpg", "DSC00061.jpg",
    "DSC00077.jpg", "DSC00092.jpg", "DSC00095.jpg", "DSC00102.jpg", "DSC00103.jpg",
    "DSC00108.jpg", "DSC00111.jpg", "DSC00122.jpg", "DSC00123.jpg", "DSC00124.jpg",
    "DSC00127.jpg", "DSC00132.jpg", "DSC00137.jpg", "DSC00142.jpg", "DSC00145.jpg",
    "DSC00150.jpg", "DSC00152.jpg", "DSC00153.jpg", "DSC00158.jpg", "DSC00200.jpg",
    "DSC00204.jpg", "DSC00231.jpg", "DSC00244.jpg", "DSC00245.jpg", "DSC00250.jpg",
    "DSC00251.jpg", "DSC00261.jpg", "DSC00263.jpg", "DSC00267.jpg", "DSC00272.jpg",
    "DSC00273.jpg", "DSC00275.jpg", "DSC00279.jpg", "DSC00280.jpg", "DSC00286.jpg",
    "DSC00293.jpg", "DSC00320.jpg", "DSC00331.jpg", "DSC00333.jpg", "DSC00338.jpg",
    "DSC00375.jpg", "DSC00409.jpg", "DSC00416.jpg", "DSC00419.jpg", "DSC00432.jpg",
    "DSC00447.jpg", "DSC00448.jpg", "DSC00461.jpg", "DSC00464.jpg", "DSC00488.jpg",
    "DSC00489-2.jpg", "DSC00493.jpg", "DSC00500.jpg", "DSC00502.jpg", "DSC00509.jpg",
    "DSC00512.jpg", "DSC00523.jpg", "DSC00551.jpg", "DSC00559.jpg", "DSC00630.jpg",
    "DSC00637.jpg", "DSC00645.jpg", "DSC00652.jpg", "DSC00682-2.jpg", "DSC00682.jpg",
    "DSC00690.jpg", "DSC00695.jpg", "DSC00699.jpg", "DSC00712.jpg", "DSC00714.jpg",
    "DSC00740.jpg", "DSC00753.jpg", "DSC00772.jpg", "DSC00821.jpg", "DSC00824.jpg",
    "DSC00869.jpg", "DSC00930.jpg", "DSC00937.jpg", "DSC00939.jpg", "DSC00956.jpg",
    "DSC00958.jpg", "DSC00980.jpg", "DSC01047.jpg", "DSC01056.jpg", "DSC01112.jpg",
    "DSC01126.jpg", "DSC01221.jpg", "DSC01224.jpg", "DSC01242.jpg",
}

NIGHT = {
    "DSC00724.jpg", "DSC00733.jpg", "DSC00734.jpg", "DSC00735.jpg", "DSC00739.jpg",
    "DSC00740.jpg", "DSC00753.jpg", "DSC00764.jpg", "DSC00769.jpg", "DSC00772.jpg",
    "DSC00777.jpg", "DSC00783.jpg", "DSC00784.jpg", "DSC00789.jpg", "DSC00797.jpg",
    "DSC00799.jpg", "DSC00818.jpg", "DSC00821.jpg", "DSC00824.jpg", "DSC00827.jpg",
    "DSC00835.jpg", "DSC00840.jpg", "DSC00853.jpg", "DSC00854.jpg", "DSC00859.jpg",
    "DSC00866.jpg", "DSC00869.jpg", "DSC00880.jpg", "DSC00889.jpg", "DSC00908.jpg",
    "DSC00917.jpg", "DSC00919.jpg", "DSC00920.jpg", "DSC00921.jpg", "DSC00922.jpg",
    "DSC00926.jpg", "DSC00930.jpg", "DSC00937.jpg", "DSC00938.jpg", "DSC00939.jpg",
    "DSC00948.jpg", "DSC00956.jpg", "DSC00958.jpg", "DSC00980.jpg", "DSC00986.jpg",
    "DSC00991.jpg", "DSC00993.jpg", "DSC01014.jpg", "DSC01020.jpg", "DSC01028.jpg",
    "DSC01047.jpg", "DSC01051.jpg", "DSC01054.jpg", "DSC01056.jpg", "DSC01068.jpg",
    "DSC01082.jpg", "DSC01085.jpg", "DSC01086.jpg", "DSC01089.jpg", "DSC01090.jpg",
    "DSC01100.jpg", "DSC01103.jpg", "DSC01104.jpg", "DSC01126.jpg", "DSC01162.jpg",
    "DSC01164.jpg", "DSC01172.jpg", "DSC01185.jpg", "DSC01188.jpg", "DSC01197.jpg",
    "DSC01221.jpg", "DSC01224.jpg", "DSC01242.jpg", "DSC01253.jpg", "DSC01266.jpg",
}

def ensure_dir(name: str) -> Path:
    d = BASE / name
    d.mkdir(exist_ok=True)
    return d

def move(name: str, dest: Path):
    src = BASE / name
    if src.exists():
        shutil.move(str(src), str(dest / name))

def main():
    dests = {
        "01-details": ensure_dir("01-details"),
        "02-portraits": ensure_dir("02-portraits"),
        "03-groupe": ensure_dir("03-groupe"),
        "04-action": ensure_dir("04-action"),
        "05-nuit": ensure_dir("05-nuit"),
    }

    for p in sorted(BASE.iterdir()):
        if not p.is_file():
            continue
        if p.name in DETAILS:
            move(p.name, dests["01-details"])
        elif p.name in GROUP:
            move(p.name, dests["03-groupe"])
        elif p.name in PORTRAITS:
            move(p.name, dests["02-portraits"])
        elif p.name in NIGHT:
            move(p.name, dests["05-nuit"])
        else:
            # Default bucket for daytime portraits and daytime action.
            # This keeps the main folder clean while preserving the set.
            move(p.name, dests["04-action" if p.name.startswith("DSC00") else "02-portraits"])

if __name__ == "__main__":
    main()
