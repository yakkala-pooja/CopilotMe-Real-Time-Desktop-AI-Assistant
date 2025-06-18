{
  "targets": [
    {
      "target_name": "whisper",
      "sources": [
        "whisper_binding.cpp",
        "whisper.cpp/ggml/src/ggml.c",
        "whisper.cpp/ggml/src/ggml-alloc.c",
        "whisper.cpp/ggml/src/ggml-backend.cpp",
        "whisper.cpp/ggml/src/ggml-backend-reg.cpp",
        "whisper.cpp/ggml/src/ggml-quants.c",
        "whisper.cpp/ggml/src/ggml-threading.cpp",
        "whisper.cpp/src/whisper.cpp"
      ],
      "include_dirs": [
        "<!@(node -p \"require('node-addon-api').include\")",
        ".",
        "whisper.cpp/include",
        "whisper.cpp/src",
        "whisper.cpp/ggml/include",
        "whisper.cpp/ggml/src"
      ],
      "dependencies": [
        "<!(node -p \"require('node-addon-api').gyp\")"
      ],
      "cflags!": ["-fno-exceptions"],
      "cflags_cc!": ["-fno-exceptions"],
      "defines": [
        "NAPI_DISABLE_CPP_EXCEPTIONS",
        "GGML_USE_ACCELERATE",
        "GGML_USE_K_QUANTS",
        "_CRT_SECURE_NO_WARNINGS",
        "_SILENCE_CXX17_CODECVT_HEADER_DEPRECATION_WARNING"
      ],
      "conditions": [
        ["OS=='win'", {
          "msvs_settings": {
            "VCCLCompilerTool": {
              "ExceptionHandling": 1,
              "AdditionalOptions": ["/std:c++17"]
            }
          }
        }],
        ["OS=='mac'", {
          "xcode_settings": {
            "GCC_ENABLE_CPP_EXCEPTIONS": "YES",
            "CLANG_CXX_LIBRARY": "libc++",
            "MACOSX_DEPLOYMENT_TARGET": "10.15",
            "OTHER_CFLAGS": [
              "-std=c++17",
              "-framework Accelerate"
            ]
          }
        }]
      ]
    }
  ]
} 