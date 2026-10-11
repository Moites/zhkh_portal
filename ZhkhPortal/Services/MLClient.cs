using System.Net.Http.Json;
using System.Text.Json.Serialization;

namespace ZhkhPortal.Api.Services;

public class MlClient(HttpClient http, ILogger<MlClient> log)
{
    public record MlResult(
        [property: JsonPropertyName("specialization")] string? Specialization,
        [property: JsonPropertyName("priority")] string? Priority,
        [property: JsonPropertyName("complexity")] string? Complexity,
        [property: JsonPropertyName("needs_review")] bool NeedsReview);

    // Возвращает null, если ML-сервис недоступен или ответил ошибкой
    public async Task<MlResult?> PredictAsync(string title, string description)
    {
        try
        {
            var resp = await http.PostAsJsonAsync("predict", new { text = $"{title}. {description}" });
            if (!resp.IsSuccessStatusCode)
            {
                log.LogWarning("ML вернул {Code}", (int)resp.StatusCode);
                return null;
            }
            return await resp.Content.ReadFromJsonAsync<MlResult>();
        }
        catch (Exception ex)
        {
            log.LogWarning(ex, "ML-сервис недоступен");
            return null;
        }
    }
}