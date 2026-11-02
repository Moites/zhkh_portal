FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY ["ZhkhPortal.Api.csproj", "./"]
RUN dotnet restore "ZhkhPortal.Api.csproj"
COPY . .
RUN dotnet publish "ZhkhPortal.Api.csproj" -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
COPY --from=build /app/publish .
ENV ASPNETCORE_URLS=http://+:5000
EXPOSE 5000
ENTRYPOINT ["dotnet", "ZhkhPortal.Api.dll"]