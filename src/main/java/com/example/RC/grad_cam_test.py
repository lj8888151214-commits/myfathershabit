import cv2
import numpy as np
import torch
from torchvision import models
from pytorch_grad_cam import GradCAM
from pytorch_grad_cam.utils.image import show_cam_on_image, preprocess_image

def apply_gradcam():
    # 1. 본인이 학습시킨 모델 파일 불러오기 (.pt 또는 .pth)
    # 만약 통째로 저장한 모델이라면: torch.load("파일명.pt", map_location="cpu")
    model_path = "your_model.pt"  # <--- 본인의 모델 파일 이름으로 수정하세요!

    try:
        model = torch.load(model_path, map_location=torch.device('cpu'))
    except Exception as e:
        print(f"모델을 불러오지 못했습니다. 경로를 확인해주세요: {e}")
        return

    model.eval()

    # 2. 마지막 합성곱(Conv) 레이어 지정
    # (사용하신 모델 구조에 따라 다릅니다. ResNet인 경우 보통 model.layer4[-1])
    target_layer = model.layer4[-1]

    # 3. 테스트할 이미지 경로 (오답을 냈던 실제 이미지 이름)
    img_path = "test_image.jpg"  # <--- 테스트할 이미지 파일 이름으로 수정하세요!

    rgb_img = cv2.imread(img_path, cv2.IMREAD_COLOR)
    if rgb_img is None:
        print(f"이미지를 찾을 수 없습니다: {img_path}")
        return

    rgb_img = cv2.resize(rgb_img, (224, 224))
    rgb_img = np.float32(rgb_img) / 255.0

    input_tensor = preprocess_image(rgb_img,
                                    mean=[0.485, 0.456, 0.406],
                                    std=[0.229, 0.224, 0.225])

    # 4. Grad-CAM 수행
    cam = GradCAM(model=model, target_layers=[target_layer])
    grayscale_cam = cam(input_tensor=input_tensor, targets=None)
    grayscale_cam = grayscale_cam[0, :]

    # 5. 시각화 및 결과 저장
    visualization = show_cam_on_image(rgb_img, grayscale_cam, use_rgb=True)
    output_path = "grad_cam_result.jpg"
    cv2.imwrite(output_path, cv2.cvtColor(visualization, cv2.COLOR_RGB2BGR))
    print(f"성공! Grad-CAM 결과가 '{output_path}' 파일로 저장되었습니다.")

if __name__ == "__main__":
    apply_gradcam()