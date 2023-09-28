import { Application } from "express";
import Stripe from "stripe";
import { Knex } from "knex";

/**
 * App conrainer schema definition.
 * this should be instantiated at the entry point of the application
 */
export interface Container {
  /**
   * express application instance
   */
  app: Application;
  /**
   * stripe instance
   */
  stripe: Stripe;
  /**
   * Knex db connection
   */
  db: Knex;
}
