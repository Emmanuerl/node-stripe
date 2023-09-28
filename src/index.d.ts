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

/**
 * Base model DB entities should extend
 */
export interface Model {
  /**
   * primary key
   */
  id: string;
  /**
   * date of creation
   */
  created_at: Date;
}

/**
 * A customer on the platform
 */
export interface Customer extends Model {
  /**
   * Stripe customer ID of the user, most likely created when user signs up
   */
  stripe_id: string;
}
