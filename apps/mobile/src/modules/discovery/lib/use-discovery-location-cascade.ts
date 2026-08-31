"use client";

import { useCallback, useEffect, useState } from "react";
import { basicsLocations, isDiscoveryApiId } from "@/shared/lib/api";

export type DiscoveryLocationOption = {
  id: string;
  name: string;
};

export type DiscoveryLocationSelection = {
  provinceId: string | null;
  provinceName: string;
  cityId: string | null;
  cityName: string;
  districtId: string | null;
  districtName: string;
};

const EMPTY_SELECTION: DiscoveryLocationSelection = {
  provinceId: null,
  provinceName: "",
  cityId: null,
  cityName: "",
  districtId: null,
  districtName: "",
};

export function useDiscoveryLocationCascade() {
  const [provinces, setProvinces] = useState<DiscoveryLocationOption[]>([]);
  const [cities, setCities] = useState<DiscoveryLocationOption[]>([]);
  const [districts, setDistricts] = useState<DiscoveryLocationOption[]>([]);
  const [selection, setSelection] =
    useState<DiscoveryLocationSelection>(EMPTY_SELECTION);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const countries = await basicsLocations.listCountries();
        const iran =
          countries.result.find(
            (item) => item.slug === "iran" || item.name === "ایران",
          ) ?? countries.result[0];
        if (!iran || cancelled) return;

        const page = await basicsLocations.listProvinces(iran.id);
        if (cancelled) return;
        setProvinces(
          page.result.map((item) => ({ id: item.id, name: item.name })),
        );
      } catch {
        if (!cancelled) setProvinces([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const provinceId = selection.provinceId;
    if (!provinceId || !isDiscoveryApiId(provinceId)) {
      setCities([]);
      return;
    }

    let cancelled = false;
    void (async () => {
      try {
        const page = await basicsLocations.listCities(provinceId);
        if (cancelled) return;
        setCities(
          page.result.map((item) => ({ id: item.id, name: item.name })),
        );
      } catch {
        if (!cancelled) setCities([]);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [selection.provinceId]);

  useEffect(() => {
    const cityId = selection.cityId;
    if (!cityId || !isDiscoveryApiId(cityId)) {
      setDistricts([]);
      return;
    }

    let cancelled = false;
    void (async () => {
      try {
        const page = await basicsLocations.listDistricts(cityId);
        if (cancelled) return;
        setDistricts(
          page.result.map((item) => ({ id: item.id, name: item.name })),
        );
      } catch {
        if (!cancelled) setDistricts([]);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [selection.cityId]);

  const selectProvince = useCallback((option: DiscoveryLocationOption) => {
    setSelection({
      provinceId: option.id,
      provinceName: option.name,
      cityId: null,
      cityName: "",
      districtId: null,
      districtName: "",
    });
  }, []);

  const selectCity = useCallback((option: DiscoveryLocationOption) => {
    setSelection((current) => ({
      ...current,
      cityId: option.id,
      cityName: option.name,
      districtId: null,
      districtName: "",
    }));
  }, []);

  const selectDistrict = useCallback((option: DiscoveryLocationOption) => {
    setSelection((current) => ({
      ...current,
      districtId: option.id,
      districtName: option.name,
    }));
  }, []);

  const resetSelection = useCallback(() => {
    setSelection(EMPTY_SELECTION);
  }, []);

  const resolvedLocationId =
    selection.districtId ?? selection.cityId ?? selection.provinceId;

  return {
    provinces,
    cities,
    districts,
    selection,
    resolvedLocationId,
    selectProvince,
    selectCity,
    selectDistrict,
    resetSelection,
  };
}
