#!/usr/bin/env python3
from pathlib import Path
import math
import shutil

import cv2
import numpy as np

BASE = Path("assets/02-portraits")
OUT = Path("assets/02-portraits-by-person")
CASCADE = cv2.data.haarcascades + "haarcascade_frontalface_default.xml"


def face_descriptor(img_path: Path):
    img = cv2.imread(str(img_path))
    if img is None:
        return None
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    detector = cv2.CascadeClassifier(CASCADE)
    faces = detector.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=4, minSize=(48, 48))
    if len(faces) == 0:
        return None
    # Pick the largest face in the frame.
    x, y, w, h = max(faces, key=lambda r: r[2] * r[3])
    pad = int(0.18 * max(w, h))
    x0 = max(0, x - pad)
    y0 = max(0, y - pad)
    x1 = min(img.shape[1], x + w + pad)
    y1 = min(img.shape[0], y + h + pad)
    crop = img[y0:y1, x0:x1]
    if crop.size == 0:
        return None
    crop = cv2.resize(crop, (96, 96), interpolation=cv2.INTER_AREA)
    hsv = cv2.cvtColor(crop, cv2.COLOR_BGR2HSV)
    # Compact descriptor: grayscale face texture + color distribution.
    gray_small = cv2.cvtColor(crop, cv2.COLOR_BGR2GRAY).astype(np.float32) / 255.0
    hist_h = cv2.calcHist([hsv], [0], None, [16], [0, 180]).flatten()
    hist_s = cv2.calcHist([hsv], [1], None, [16], [0, 256]).flatten()
    hist_v = cv2.calcHist([hsv], [2], None, [16], [0, 256]).flatten()
    vec = np.concatenate([gray_small.flatten(), hist_h, hist_s, hist_v]).astype(np.float32)
    vec /= (np.linalg.norm(vec) + 1e-8)
    return vec


def cluster(vectors, threshold=0.38):
    clusters = []
    for item in vectors:
        best_i = None
        best_d = None
        for i, c in enumerate(clusters):
            d = np.linalg.norm(item["vec"] - c["centroid"])
            if best_d is None or d < best_d:
                best_d = d
                best_i = i
        if best_d is not None and best_d <= threshold:
            c = clusters[best_i]
            c["items"].append(item)
            c["centroid"] = np.mean([x["vec"] for x in c["items"]], axis=0)
            c["centroid"] /= (np.linalg.norm(c["centroid"]) + 1e-8)
        else:
            clusters.append({"items": [item], "centroid": item["vec"].copy()})
    clusters.sort(key=lambda c: (-len(c["items"]), c["items"][0]["name"]))
    return clusters


def main():
    OUT.mkdir(exist_ok=True)
    for p in OUT.glob("person-*"):
        if p.is_dir():
            shutil.rmtree(p)

    items = []
    missed = []
    for p in sorted(BASE.iterdir()):
        if not p.is_file():
            continue
        vec = face_descriptor(p)
        if vec is None:
            missed.append(p.name)
            continue
        items.append({"name": p.name, "path": p, "vec": vec})

    clusters = cluster(items)
    report = []
    for idx, c in enumerate(clusters, start=1):
        d = OUT / f"person-{idx:02d}"
        d.mkdir(exist_ok=True)
        names = []
        for item in c["items"]:
            shutil.copy2(item["path"], d / item["name"])
            names.append(item["name"])
        report.append((d.name, len(names), names[:8]))

    (OUT / "_unmatched").mkdir(exist_ok=True)
    for name in missed:
        shutil.copy2(BASE / name, OUT / "_unmatched" / name)

    print(f"clusters={len(clusters)} matched={len(items)} unmatched={len(missed)}")
    for name, count, sample in report:
        print(f"{name}: {count} -> {', '.join(sample)}")
    if missed:
        print("unmatched sample:", ", ".join(missed[:20]))


if __name__ == "__main__":
    main()
