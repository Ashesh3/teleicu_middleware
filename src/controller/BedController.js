import { PrismaClient } from "@prisma/client";
import dayjs from "dayjs";

const prisma = new PrismaClient();

export class BedController {
  static list = async (req, res) => {
    try {
      const beds = await prisma.bed.findMany({
        where: {
          deleted: false,
        },
        include: {
          monitorPreset: true,
          camera: true,
        },
        orderBy: [{ updatedAt: "desc" }],
      });

      const cameras = await prisma.asset.findMany({
        where: {
          deleted: false,
          type: "CAMERA",
        },
        orderBy: [{ updatedAt: "desc" }],
      });

      res.render("pages/beds/list", {
        dayjs,
        beds,
        cameras,
        errors: req.flash("error"),
      });
    } catch (err) {
      res.render("pages/beds/list", {
        dayjs,
        beds: [],
        cameras: [],
        errors: [err.message],
      });
    }
  };

  static create = async (req, res) => {
    const { name, externalId, cameraId, preset_x, preset_y, preset_zoom } =
      req.body;

    try {
      await prisma.bed.create({
        data: {
          name,
          externalId,
          cameraId: Number(cameraId) || undefined,
          monitorPreset: {
            create: {
              x: Number(preset_x) || undefined,
              y: Number(preset_y) || undefined,
              zoom: Number(preset_zoom) || undefined,
            },
          },
        },
      });

      res.redirect("/beds");
    } catch (err) {
      req.flash("error", err.message);
      res.redirect("/beds");
    }
  };

  static show = async (req, res) => {
    const { id } = req.params;

    try {
      const bed = await prisma.bed.findUnique({
        where: {
          id: Number(id),
        },
        include: {
          monitorPreset: true,
          camera: true,
        },
      });

      const cameras = await prisma.asset.findMany({
        where: {
          deleted: false,
          type: "CAMERA",
        },
        orderBy: [{ updatedAt: "desc" }],
      });

      res.render("pages/beds/edit", {
        dayjs,
        bed,
        cameras,
        errors: req.flash("error"),
      });
    } catch (err) {
      req.flash("error", err.message);
      res.redirect("/beds");
    }
  };

  static edit = async (req, res) => {
    const { id } = req.params;
    const { name, externalId, cameraId, preset_x, preset_y, preset_zoom } =
      req.body;

    try {
      await prisma.bed.update({
        where: {
          id: Number(id),
        },
        data: {
          name,
          externalId,
          cameraId: Number(cameraId) || undefined,
          monitorPreset: {
            update: {
              x: Number(preset_x) || undefined,
              y: Number(preset_y) || undefined,
              zoom: Number(preset_zoom) || undefined,
            },
          },
        },
      });

      res.redirect("/beds");
    } catch (err) {
      req.flash("error", err.message);
      res.redirect("/beds");
    }
  };

  static confirmDelete = async (req, res) => {
    const { id } = req.params;

    try {
      const bed = await prisma.bed.findUnique({
        where: {
          id: Number(id),
        },
      });

      res.render("pages/beds/delete", { dayjs, bed });
    } catch (err) {
      req.flash("error", err.message);
      res.redirect("/beds");
    }
  };

  static delete = async (req, res) => {
    const { id } = req.params;

    try {
      await prisma.bed.update({
        where: {
          id: Number(id),
        },
        data: {
          deleted: true,
        },
      });

      res.redirect("/beds");
    } catch (err) {
      req.flash("error", err.message);
      res.redirect("/beds");
    }
  };
}
