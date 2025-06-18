#include <napi.h>
#include "whisper.h"
#include "ggml.h"
#include <string>
#include <vector>
#include <memory>

class WhisperWrapper : public Napi::ObjectWrap<WhisperWrapper> {
public:
    static Napi::Object Init(Napi::Env env, Napi::Object exports);
    WhisperWrapper(const Napi::CallbackInfo& info);
    ~WhisperWrapper();

private:
    static Napi::FunctionReference constructor;
    struct whisper_context* ctx;

    Napi::Value Transcribe(const Napi::CallbackInfo& info);
    Napi::Value LoadModel(const Napi::CallbackInfo& info);
};

Napi::FunctionReference WhisperWrapper::constructor;

Napi::Object WhisperWrapper::Init(Napi::Env env, Napi::Object exports) {
    Napi::HandleScope scope(env);

    Napi::Function func = DefineClass(env, "WhisperWrapper", {
        InstanceMethod("loadModel", &WhisperWrapper::LoadModel),
        InstanceMethod("transcribe", &WhisperWrapper::Transcribe),
    });

    constructor = Napi::Persistent(func);
    constructor.SuppressDestruct();

    exports.Set("WhisperWrapper", func);
    return exports;
}

WhisperWrapper::WhisperWrapper(const Napi::CallbackInfo& info) 
    : Napi::ObjectWrap<WhisperWrapper>(info), ctx(nullptr) {
}

WhisperWrapper::~WhisperWrapper() {
    if (ctx) {
        whisper_free(ctx);
    }
}

Napi::Value WhisperWrapper::LoadModel(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    if (info.Length() < 1 || !info[0].IsString()) {
        Napi::TypeError::New(env, "String expected").ThrowAsJavaScriptException();
        return env.Null();
    }

    std::string model_path = info[0].As<Napi::String>().Utf8Value();

    if (ctx) {
        whisper_free(ctx);
    }

    struct whisper_context_params cparams = whisper_context_default_params();
    ctx = whisper_init_from_file_with_params(model_path.c_str(), cparams);
    if (!ctx) {
        Napi::Error::New(env, "Failed to load model").ThrowAsJavaScriptException();
        return env.Null();
    }

    return env.Undefined();
}

Napi::Value WhisperWrapper::Transcribe(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    if (!ctx) {
        Napi::Error::New(env, "Model not loaded").ThrowAsJavaScriptException();
        return env.Null();
    }

    if (info.Length() < 1 || !info[0].IsTypedArray()) {
        Napi::TypeError::New(env, "Float32Array expected").ThrowAsJavaScriptException();
        return env.Null();
    }

    Napi::TypedArray array = info[0].As<Napi::TypedArray>();
    if (array.TypedArrayType() != napi_float32_array) {
        Napi::TypeError::New(env, "Float32Array expected").ThrowAsJavaScriptException();
        return env.Null();
    }

    Napi::Float32Array audio_data = array.As<Napi::Float32Array>();
    size_t n_samples = audio_data.ByteLength() / sizeof(float);

    whisper_full_params wparams = whisper_full_default_params(WHISPER_SAMPLING_GREEDY);
    wparams.print_progress = false;
    wparams.print_special = false;
    wparams.print_realtime = false;
    wparams.print_timestamps = false;
    wparams.translate = false;
    wparams.language = "en";
    wparams.n_threads = 4;

    if (whisper_full(ctx, wparams, audio_data.Data(), n_samples) != 0) {
        Napi::Error::New(env, "Failed to process audio").ThrowAsJavaScriptException();
        return env.Null();
    }

    const int n_segments = whisper_full_n_segments(ctx);
    std::string text;

    for (int i = 0; i < n_segments; ++i) {
        const char* segment_text = whisper_full_get_segment_text(ctx, i);
        text += segment_text;
        if (i < n_segments - 1) text += " ";
    }

    return Napi::String::New(env, text);
}

Napi::Object Init(Napi::Env env, Napi::Object exports) {
    return WhisperWrapper::Init(env, exports);
}

NODE_API_MODULE(whisper, Init) 