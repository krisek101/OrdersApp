package models

import play.api.data.Form
import play.api.data.Forms._
import play.api.libs.json.{Json, OFormat}


object Order {

  case class Order(id: Int, date: String)

  implicit val orderFormat: OFormat[Order] = Json.format[Order]

  val orderForm = Form(
    mapping(
      "id" -> number,
      "date" -> text,
    )(Order.apply)(Order.unapply)
  )
}