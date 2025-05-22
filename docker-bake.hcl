group "default" {
  targets = ["app"]
}

variable "TAG" {
  validation {
    condition = TAG == regex("^(?:\\d+\\.\\d+\\.\\d+)?$", TAG)
    error_message = "The variable 'TAG' has to be in the 'x.x.x' format."
  }
}

variable "IMAGE" {
  default = "ghcr.io/johngeorgewright/esm.dev"
}

target "app" {
  context = "."
  dockerfile = "Dockerfile"
  platforms = ["linux/amd64", "linux/arm64"]
  tags = [
    "${IMAGE}:latest",
    notequal("", TAG) ? "${IMAGE}:${TAG}" : ""
  ]
}
