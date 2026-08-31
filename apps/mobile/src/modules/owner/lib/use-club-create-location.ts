"use client";

import { useCallback, useEffect, useState } from "react";
import type {
  Control,
  UseFormGetValues,
  UseFormSetValue,
} from "react-hook-form";
import { useWatch } from "react-hook-form";
import { basicsLocations, isDiscoveryApiId } from "@/shared/lib/api";
import type { ClubCreateFormState } from "./club-create-form";

export type ClubCreateLocationOption = {
  id: string;
  name: string;
};

export function useClubCreateLocation(
  control: Control<ClubCreateFormState>,
  setValue: UseFormSetValue<ClubCreateFormState>,
  getValues: UseFormGetValues<ClubCreateFormState>,
) {
  const location = useWatch({ control, name: "location" });

  const [countries, setCountries] = useState<ClubCreateLocationOption[]>([]);
  const [provinces, setProvinces] = useState<ClubCreateLocationOption[]>([]);
  const [cities, setCities] = useState<ClubCreateLocationOption[]>([]);
  const [districts, setDistricts] = useState<ClubCreateLocationOption[]>([]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const page = await basicsLocations.listCountries();
        if (cancelled) return;
        setCountries(
          page.result.map((item) => ({ id: item.id, name: item.name })),
        );
        const current = getValues("location");
        if (current.countryId) return;
        const iran =
          page.result.find((item) => item.slug === "iran") ?? page.result[0];
        if (!iran) return;
        setValue(
          "location",
          {
            ...current,
            countryId: iran.id,
            country: iran.name,
          },
          { shouldDirty: false },
        );
      } catch {
        if (!cancelled) setCountries([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [getValues, setValue]);

  useEffect(() => {
    const countryId = location.countryId;
    if (!countryId || !isDiscoveryApiId(countryId)) {
      setProvinces([]);
      return;
    }

    let cancelled = false;
    void (async () => {
      try {
        const page = await basicsLocations.listProvinces(countryId);
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
  }, [location.countryId]);

  useEffect(() => {
    const provinceId = location.provinceId;
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
  }, [location.provinceId]);

  useEffect(() => {
    const cityId = location.cityId;
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
  }, [location.cityId]);

  const patchLocation = useCallback(
    (patch: Partial<ClubCreateFormState["location"]>) => {
      const current = getValues("location");
      setValue(
        "location",
        {
          ...current,
          ...patch,
        },
        { shouldDirty: true },
      );
    },
    [getValues, setValue],
  );

  const selectCountry = (option: ClubCreateLocationOption) => {
    patchLocation({
      countryId: option.id,
      country: option.name,
      provinceId: null,
      province: "",
      cityId: null,
      city: "",
      districtId: null,
      district: "",
    });
  };

  const selectProvince = (option: ClubCreateLocationOption) => {
    patchLocation({
      provinceId: option.id,
      province: option.name,
      cityId: null,
      city: "",
      districtId: null,
      district: "",
    });
  };

  const selectCity = (option: ClubCreateLocationOption) => {
    patchLocation({
      cityId: option.id,
      city: option.name,
      districtId: null,
      district: "",
    });
  };

  const selectDistrict = (option: ClubCreateLocationOption) => {
    patchLocation({
      districtId: option.id,
      district: option.name,
    });
  };

  return {
    location,
    countries,
    provinces,
    cities,
    districts,
    patchLocation,
    selectCountry,
    selectProvince,
    selectCity,
    selectDistrict,
  };
}
