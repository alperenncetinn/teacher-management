FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["StajYonetim.API.csproj", "./"]
RUN dotnet restore "StajYonetim.API.csproj"
COPY . .
WORKDIR "/src/."
RUN dotnet build "StajYonetim.API.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "StajYonetim.API.csproj" -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "StajYonetim.API.dll"]
