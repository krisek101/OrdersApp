package controllers

import javax.inject._

import play.api.db._
import play.api.mvc._


@Singleton
class OrdersController @Inject()(db: Database, cc: ControllerComponents) extends AbstractController(cc) {

  def list = Action {
    Ok(views.html.orders())
  }

}